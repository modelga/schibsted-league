const Events = require('events');
const _ = require('lodash');
const { factories, ProjectionStorage, exists } = require('./projections');

const gcConfigDefault = {
  idleTime: 10 * 1000,
  edenSize: 100,
  gcRun: 5000,
};

class ProjectionManager extends Events {
  constructor(gcConfig, customFactories) {
    super();
    this.gc = Object.assign({}, gcConfigDefault, gcConfig || {});
    this.factories = Object.assign({}, factories, customFactories || {});
    this.projections = {};
    this.projectionIdles = {};

    if (this.gc.gcRun > 0) {
      setInterval(() => this.emit('gc:run'), this.gc.gcRun);
    }

    this.on('gc:run', () => {
      const now = new Date().getTime();
      const toRemove = _.chain(this.projectionIdles)
      .pickBy(v => now - v > this.gc.idleTime)
      .keys()
      .drop(this.gc.edenSize)
      .value();
      _.each(toRemove, (k) => {
        this.projections[k].destroy();
        delete this.projections[k];
        delete this.projectionIdles[k];
      });
    });

    this.on('error', console.error);
  }

  findOrCreateProjection(name, aggregateId) {
    const id = ProjectionStorage.id(name, aggregateId);
    if (this.projections[id]) {
      return this.projections[id];
    }
    if (this.factories[name]) {
      return this.createProjection(name, aggregateId);
    }
    throw new Error(`Not found factory for projection ${name} (${aggregateId})`);
  }

  createProjection(name, aggregateId) {
    const id = ProjectionStorage.id(name, aggregateId);
    const p = this.factories[name](aggregateId);
    p.on('state', (state, updatedProjection) => {
      console.log('updating the state');
      this.projections[id] = updatedProjection;
      this.projectionIdles[id] = new Date().getTime();
    });
    return p;
  }

  handle(name, aggregateId, event) {
    const p = this.findOrCreateProjection(name, aggregateId);
    p.handle(event);
  }

  projection(name, aggregateId) {
    return exists(name, aggregateId)
      .then(() => {
        this.findOrCreateProjection(name, aggregateId);
      });
  }
}

module.exports = (gcConfig, factory) => {
  const manager = new ProjectionManager(gcConfig, factory);
  manager.on('event', (name, aggregateId, event) => {
    if (name && aggregateId && event) {
      manager.handle(name, aggregateId, event);
    } else {
      manager.emit('error',
      new Error(`Invalid preamble: event: ${event}, projection: ${name} (${aggregateId})`));
    }
  });
  return manager;
};
