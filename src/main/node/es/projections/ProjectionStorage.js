const { db } = require('../../db');
const { Event } = require('../Event');
const config = require('../../config').eventSourced;
const Events = require('events');
const _ = require('lodash');

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
    this.sync().then((data) => {
      const { state, meta } = data;
      this.iState = state;
      this.meta = meta;
      this.synced = true;
      data.postSync();
    });
    this.save = _.debounce(() => this.saveImmediate('debounced'), 50, { maxWait: 250 });
    this.once('ready', () => {
      this.emit('state', this.state, this);
    });
  }
  sync() {
    return db.getAsync(this.projName).then((data) => {
      const ready = () => this.emit('ready', this);
      if (!data) {
        this.iState = {};
        return { state: this.initialState(), meta: {}, postSync: () => this.saveImmediate('initial').then(ready) };
      }
      return Object.assign({}, JSON.parse(data), { postSync: ready });
    });
  }
  clean() {
    return db.delAsync(this.projName);
  }
  initialState() {
    return {};
  }
  handle(event) {
    if (event && event instanceof Event) {
      const handleId = `handle${ucFirst(event.name)}`;
      this.meta[event.meta.source] = event.meta.index;
      const eventHandler = this[handleId];
      if (eventHandler && eventHandler instanceof Function) {
        return this.updateState(eventHandler.call(this, this.state(), event.payload, event.meta));
      }
      return Promise.reject(new Error(`unhadled event expected on ${handleId}`));
    }
    return Promise.reject(new Error('not an event object'));
  }
  updateState(state) {
    this.iState = state;
    this.save();
    this.emit('state', state, this);
    return Promise.resolve(state);
  }
  saveImmediate(cause) { // eslint-disable-line
    const data = JSON.stringify({ state: this.state(), meta: this.meta });
    return db.setAsync(this.projName, data);
  }
  state() {
    return this.iState || {};
  }
  destroy(cb) {
    this.removeAllListeners();
    this.saveImmediate('immediate').then(() => (typeof cb === 'function' ? cb() : this.emit('saved')));
  }
}

module.exports = { ProjectionStorage, NotExists };
