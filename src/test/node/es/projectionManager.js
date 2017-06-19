/* eslint-env node, mocha */
const base = '../../../main/node';

require('../config');
require('should');

const managerFactory = require(`${base}/es/ProjectionManager`);
const { ProjectionStorage, NotExists } = require(`${base}/es/projections`);
const { Event } = require(`${base}/es/Event`);
const { db } = require(`${base}/db/db`);
class Touch extends Event {
  constructor(by) {
    super('touch', { by }, false, { source: 'es:fakes', index: 1 });
  }
}
class FakeProjectionStorage extends ProjectionStorage {
  constructor(id) {
    super('fake', id);
    this.touched = false;
  }
  handleTouch(state, event) {
    return Object.assign({}, state, { touched: (state.touched || []).concat(event) });
  }
  destroy() {
    return Promise.resolve(this);
  }
}

const fakeFactory = {
  fake: id => new FakeProjectionStorage(id),
};
const gcConfig = { gcRun: 0, edenSize: 0, idleTime: 0 }; // disable both gc and cache

describe('ProjectionManager', () => {
  let manager;
  before(() => {
    manager = managerFactory(gcConfig, fakeFactory);
    return db.delAsync('proj:fake-1');
  });

  describe('related projection fake-1', () => {
    const name = 'fake';
    const id = 1;
    it('should not exists', (done) => {
      manager.projection(name, id)
       .catch(NotExists, () => done())
       .catch(Error, e => done(e));
    });

    it('should create an projection', (done) => {
      manager.createProjection(name, id)
      .once('ready', (created) => {
        manager.projection(name, id)
        .then((returned) => {
          returned.should.equal(created);
          done();
        }).catch(done);
      });
    });

    it('should mutate on event', () =>
      manager.handle(name, id, new Touch(1))
        .then((state) => {
          state.should.deepEqual({ touched: [{ by: 1 }] });
          manager.projection('fake', 1).then(p => p.state()).should.finally.equal(state);
        }),
    );

    it('meta should be updated', () =>
      manager.projection('fake', 1).then(p => p.meta)
      .should.finally.deepEqual({ 'es:fakes': 1 }),
    );

    describe('cleanum using gc:run', () => {
      it('should contian projection', () => {
        manager.projections.should.have.size(1);
        manager.projectionIdles.should.have.size(1);
      });

      it('should handle gc:done after gc run', (done) => {
        manager.once('gc:done', (removed) => {
          removed.should.have.size(1);
          manager.projections.should.have.size(0);
          manager.projectionIdles.should.have.size(0);
          done();
        });
        setTimeout(() => manager.emit('gc:run'), 2);
      });
    });
  });

  after(() => manager.removeAllListeners());
});
