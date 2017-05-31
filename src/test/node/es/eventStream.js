/* eslint-env node, mocha */
const base = '../../../main/node';

require('../config');
require('should');
const _ = require('lodash');

const { db, toJson } = require(`${base}/db/db`);
const { EventStream } = require(`${base}/es/EventStream`);

describe('EventStream', () => {
  let stream;
  before((done) => {
    const payload = {};
    const data = {
      'es:league-1': [
      { name: 'created', time: 1, payload },
      { name: 'make', time: 2, payload },
      ],
      'es:league-2': [
      { name: 'created', time: 1, payload },
      { name: 'hate', time: 2, payload },
      { name: 'round', time: 3, payload },
      { name: 'found', time: 5, payload },
      ],
    };
    Promise.all(_.keys(data).map(s => db.delAsync(s)))
    .then(() => _.map(data, (events, es) => db.rpushAsync(...[es].concat(events.map(toJson)))))
    .then(e => Promise.all(e))
    .then(() => done());
  });

  describe('should set-up event stream', () => {
    it('instance created', () => {
      stream = new EventStream();
      stream.should.be.instanceOf(EventStream);
      stream.destroy();
    });
    it('listen on events', (done) => {
      let events = 0;
      stream = new EventStream();
      stream.events(0)(() => {
        if (++events === 6) { // eslint-disable-line
          stream.destroy();
          done();
        }
      });
    });
    it('listen on events with preservation', (done) => {
      let events = 0;
      stream = new EventStream(0, true);
      stream.events(0);
      stream.start();
      setTimeout(() => {
        stream.listenTo((a) => {
          if (++events === 6) { // eslint-disable-line
            stream.destroy();
            done();
          }
        });
      }, 20);
    });
    it('listen watch on new events', (done) => {
      stream = new EventStream(0, false);
      stream.events(0);
      stream.start();
      stream.listenTo(() => {
        stream.destroy();
        done();
      });
      db.rpush('es:league-2', toJson({ name: 'found', time: 5, payload: {} }));
    });
  });

  after(() => {
    stream.destroy();
  });
});
