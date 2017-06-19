const { db } = require('../db');
const config = require('../config').eventSourced;
const ObserveStream = require('./Stream');
const { Event } = require('./Event');
const _ = require('lodash');

class EventStorage {
  constructor(storages) {
    this.storages = _.mapValues(storages,
      s => ({
        name: `${config.esPrefix}:${s.name}-${s.aggregateId}`,
      }));
  }

  events(listener) {
    return new ObserveStream(this.storage, listener);
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
