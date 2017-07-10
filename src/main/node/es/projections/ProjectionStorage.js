const { db } = require('../../db');
const { Event } = require('../Event');
const config = require('../../config').eventSourced;
const Events = require('events');
const _ = require('lodash');

const extend = (state, ...others) => {
  const cp = _.spread(Object.assign);
  return cp([{}].concat(state || {}).concat(_.flatten(others)));
};

class NotExists extends Error {}

const ucFirst = string => string.charAt(0).toUpperCase() + string.slice(1);

class ProjectionStorage extends Events {
  static id(name, aggregateId) {
    return `${config.projPrefix}:${name}-${aggregateId}`;
  }
  static exists(name, aggregateId) {
    const id = ProjectionStorage.id(name, aggregateId);
    return db.existsAsync(id)
      .then((r) => {
        if (r) { return; }
        throw new NotExists(`Projection '${id}' do not exists must be created explicitly first`);
      });
  }
  constructor(name, aggregateId) {
    super();
    this.projName = ProjectionStorage.id(name, aggregateId);
    this.name = name; // family name
    this.aggregateId = aggregateId;
    this.meta = {};
    this.iState = {};
    this.synced = false;
    this.once('ready', () => {
      setImmediate(() => this.emit('state', this.state, this));
    });
    this.sync().then((data) => {
      const { state, meta } = data;
      this.iState = state;
      this.meta = meta;
      this.synced = true;
      data.postSync();
    });
    this.save = _.debounce(() => this.saveImmediate('debounced'), 50, { maxWait: 250 });
  }
  async sync() {
    const data = await db.getAsync(this.projName);
    const ready = () => this.emit('ready', this);
    if (!data) {
      this.iState = {};
      return { state: this.initialState(), meta: {}, postSync: () => this.saveImmediate('initial').then(ready) };
    }
    return Object.assign({}, JSON.parse(data), { postSync: ready });
  }
  clean() {
    return db.delAsync(this.projName);
  }
  initialState() {
    return {};
  }
  async handle(event) {
    if (event && event instanceof Event) {
      const handleId = `handle${ucFirst(event.name)}`;
      this.meta[event.meta.source] = { index: event.meta.index };
      const eventHandler = this[handleId];
      if (eventHandler && eventHandler instanceof Function) {
        const toExtend = (...next) => extend(this.state(), next);
        const newState = eventHandler.call(this, toExtend, event.payload, this.state(), event.meta);
        if (newState) {
          return this.updateState(newState);
        }
        return this.state();
      }
      console.debug(`unhadled event expected on ${handleId} in projection ${this.name}`);
      return this.state();
    }
    throw new Error('not an event object');
  }
  async updateState(state) {
    this.iState = state;
    this.save();
    this.emit('state', state, this);
    return state;
  }
  /**
   * save only when already entry exists (prevent storage of retained keys)
   */
  async saveImmediate(cause) { // eslint-disable-line
    const data = JSON.stringify({ state: this.state(), meta: this.meta });
    const exists = await db.existsAsync(this.projName);
    if (exists || cause === 'initial') {
      return db.setAsync(this.projName, data);
    }
    return false;
  }
  state() {
    return this.iState || {};
  }
  emitState() {
    if (this.synced) {
      setImmediate(() => this.emit('state', this.state, this));
    }
    return this;
  }
  destroy(cb) {
    this.removeAllListeners();
    this.saveImmediate('immediate').then(() => (typeof cb === 'function' ? cb() : this.emit('saved')));
  }
}

module.exports = { ProjectionStorage, NotExists, extend };
