const { db } = require('../db');
const Events = require('events');
const config = require('../config').eventSourced;

const ObserveStream = require('./ObserveStream');

const _ = require('lodash');

class EventStream {
  constructor(stamp, preserve, key) {
    this.stamp = stamp || 0;
    this.observers = {};
    this.stream = new Events();
    this.preserve = preserve || false;
    this.key = key || `${config.esPrefix}:*`;
  }
  keys(since) {
    return db.keysAsync(this.key).then((keys) => {
      const newStreams = _.difference(keys, _.keys(this.observers));
      const retainedStreams = _.difference(_.keys(this.observers), keys);
      newStreams.forEach(key => this.feed(key, since));
      retainedStreams.forEach(key => this.retain(key));
    });
  }
  feed(key, since) {
    this.observers[key] = new ObserveStream(key, since, e => this.stream.emit('event', e), this.preserve);
  }
  retain(key) {
    this.observers[key].destroy();
    delete this.observers[key];
  }
  start() {
    return this.keys(this.since).then(() => {
      this.interval = setInterval(() => {
        this.keys(new Date().getTime());
      }, 5);
    });
  }
  events() {
    return ((listener) => {
      if (!this.started) {
        this.start();
      }
      this.stream.on('event', listener);
    });
  }
  listenTo(listener) {
    this.start().then(() => {
      _.forEach(this.observers, o => o.preserveMe(listener));
      this.stream.on('event', listener);
    });
  }
  destroy() {
    clearInterval(this.interval);
    _.forEach(this.observers, (o => o.destroy()));
  }
}

module.exports = { EventStream, ObserveStream };
