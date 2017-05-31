/* eslint-env node, mocha */
const base = '../../../main/node';

require('../config');
require('should');

const managerFactory = require(`${base}/es/ProjectionManager`);
const { ProjectionStorage } = require(`${base}/es/projections`);
const { db } = require(`${base}/db/db`);

class FakeProjectionStorage extends ProjectionStorage {
  constructor(id) {
    super('fake', id);
    this.touched = false;
  }
  handle(event) {
    this.touched = event;
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
    const event = { a: 1 };
    it('should not exists', (done) => {
      manager.projection(name, id).catch(notExists => done());
    });

    it('should create an projection', (done) => {
      manager.createProjection(name, id)
      .once('ready', (created) => {
        manager.projection(name, id)
        .then((returned) => {
          done();
        }).catch(done);
      });
    });

    it('should be touched', () => {
      manager.projection(name, id).then(p => console.log);
    });
  });

  describe('gc run', () => {
    it('should contian projection', () => {
      manager.projections.should.have.size(1);
      manager.projectionIdles.should.have.size(1);
    });

    it('should remove cache after gc run', (done) => {
      manager.emit('gc:run');
      setTimeout(() => {
        manager.projections.should.have.size(0);
        manager.projectionIdles.should.have.size(0);
        done();
      }, 10);
    });
  });
  after(() => manager.removeAllListeners());
});
