const { db } = require('../db');
const Events = require('events');
const config = require('../config').eventSourced;
const Stream = require('./Stream');

const _ = require('lodash');

class EventStream {
  constructor(since, key) {
    this.since = since || {};
    this.observers = {};
    this.stream = new Events();
    const aKey = (key || `${config.esPrefix}:*`);
    if (typeof aKey === 'string') {
      this.key = aKey.split(',');
    } else {
      this.key = aKey || [];
    }
    this.destroyed = false;
  }
  keys(now) {
    const keysList = () => {
      if (this.key.length === 1 && this.key[0].indexOf('*') !== -1) {
        return db.keysAsync(this.key[0]);
      }
      return Promise.resolve(this.key);
    };

    return keysList().then((keys) => {
      const newStreams = _.difference(keys, _.keys(this.observers));
      const retainedStreams = _.difference(_.keys(this.observers), keys);
      newStreams.forEach(key => this.feed(key, this.since[key] || now));
      retainedStreams.forEach(key => this.retain(key));
    });
  }
  feed(key, meta) {
    const stream = new Stream(key, meta, (e) => {
      this.observers[key].upToDate = e.meta.index === stream.size;
      this.observers[key].lastIndex = e.meta.index;
      this.stream.emit('event', e);
    });
    this.observers[key] = { stream, key, upToDate: false, index: meta.index || 0 };
    stream.on('up-to-date', this.updateSync.bind(this));
    stream.on('behind', () => {
      this.observers[key].upToDate = false;
    });
  }
  updateSync(data) {
    this.observers[data.name].upToDate = true;
    this.observers[data.name].lastIndex = data.index;
    const upToDateNow = _.filter(this.observers, (o => o.upToDate)).length;
    if (upToDateNow === _.size(this.observers)) {
      this.stream.emit('up-to-date',
      _.map(this.observers, o => ({ source: o.key, index: o.lastIndex })));
    }
  }
  store(events, family) {
    const store = o => o.stream.push(events)
                        .then(() => o.stream.updateSize());
    if (_.size(this.observers) === 1) {
      return Promise.all(_.map(this.observers, store));
    }
    return Promise.all(_.chain(this.observers).filter(o => !family || o.stream.family() === family).map(store).value());
  }
  retain(key) {
    this.observers[key].destroy();
    delete this.observers[key];
  }
  static id(name, id) {
    return `${config.esPrefix}:${name}-${id}`;
  }
  start() {
    return this.keys(this.since).then(() => {
      const callback = () => {
        if (!this.destroyed) {
          this.keys(new Date().getTime());
          setTimeout(callback, 13);
        }
      };
      setImmediate(callback);
      return this;
    });
  }
  events(listener) {
    if (!this.started) {
      this.start();
    }
    this.stream.on('event', listener);
  }
  destroy() {
    this.destroyed = true;
    this.stream.removeAllListeners();
    _.forEach(this.observers, (o => o.stream.destroy()));
  }
}

module.exports = { EventStream, Stream };
