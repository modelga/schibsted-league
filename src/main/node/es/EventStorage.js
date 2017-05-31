const { db } = require('../db');

const config = require('../config').eventSourced;

const ObserveStream = require('./ObserveStream');
const Event = require('./Event');
// const config = require('../config').eventSourced;

class EventStorage {
  constructor(name, aggregateId) {
    this.name = name;
    this.aggregateId = aggregateId;
    this.storage = `${config.esPrefix}:${name}-${aggregateId}`;
  }

  events(listener, index) {
    return new ObserveStream(this.storage, { index }, listener);
  }

  store(event) {
    return this.add(event);
  }

  add(event) {
    if (event instanceof Event) {
      return db.rpushAsync(this.storage, event.toJson());
    }
    return Promise.reject(new Error('Not an Event instance'));
  }
}

module.exports = EventStorage;
