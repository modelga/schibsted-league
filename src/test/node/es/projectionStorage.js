/* eslint-env node, mocha */
const base = '../../../main/node';

require('../config');
require('should');

const { ProjectionStorage } = require(`${base}/es/projections/ProjectionStorage`);
const { Event } = require(`${base}/es/Event`);
const { db } = require(`${base}/db/db`);
const { projPrefix } = require(`${base}/config`).eventSourced;

class CommandProjection extends ProjectionStorage {
  constructor(aggregateId) {
    super('name', aggregateId);
  }
  initialState() {
    return { payloads: [] };
  }
  handleCommand(extend, payload, { payloads }) {
    return extend({ payloads: payloads.concat(payload) });
  }
}

const event1 = new Event('command', 1, { a: 1 }, { source: 'stream-1', index: 0 });
const event3 = new Event('no-command', 1, { a: 1 }, { source: 'stream-1', index: 1 });
const event2 = new Event('command', 1, { a: 2 }, { source: 'stream-2', index: 0 });

describe('ProjectionStorage', () => {
  before(() => db.delAsync(`${projPrefix}:name-1`)
              .then(() => db.delAsync(`${projPrefix}:name-2`)));
  it('projection can be created', (done) => {
    new CommandProjection(1)
      .once('ready', p => p.destroy(done));
  });

  it('projection should handle events', (done) => {
    new CommandProjection(1)
      .once('ready', (p) => {
        p.handle(event1)
        .then((newState) => {
          newState.should.deepEqual({ payloads: [event1.payload] });
          p.destroy(done());
        });
      });
  });

  it('projection should be restored from db', (done) => {
    new CommandProjection(1)
      .once('ready', (p) => {
        p.state().should.deepEqual({ payloads: [event1.payload] });
        p.destroy(done);
      });
  });

  it('another projection should not affect previous', (done) => {
    new CommandProjection(2)
      .once('ready', (p) => {
        p.state().should.deepEqual({ payloads: [] });
        p.destroy(done);
      });
  });

  it('projection should store data ', (done) => {
    new CommandProjection(2)
      .once('ready', (p) => {
        p.handle(event1)
        .then(() => p.handle(event2))
        .then((newState) => {
          p.state().should.equal(newState);
          p.state().should.deepEqual({ payloads: [event1.payload, event2.payload] });
          p.destroy(done);
        });
      });
  });

  it('projection should how change projection for unhandled messages', () => new CommandProjection(2)
        .once('ready', (p) => {
          p.handle(event3)
          .then((state) => {
            state.should.equal(p.state());
          });
        }));
});
