const { Event } = require('./Event');
const Events = require('events');
const { db } = require('../db');
const config = require('../config').eventSourced;
const _ = require('lodash');

module.exports = class Stream {
  constructor(name, since, listener, preserve) {
    this.name = name;
    this.since = typeof since === 'number' || typeof since === 'string' ? since : 0;
    this.index = typeof since === 'object' && since.index ? since.index : 0;
    this.preserve = !!preserve;
    this.preserved = [];
    this.events = new Events();
    if (listener) {
      this.events.on('event', listener);
    } else {
      console.error(`No listener defined on Stream ${name}`);
    }
    this.alive = true;
    this.init();
  }
  family() {
    return this.name.replace(`${config.esPrefix}:`, '').split('-')[0];
  }
  listenTo(listener) {
    this.preserveMe(listener);
    this.events.on('event', listener);
  }
  preserveMe(listener) {
    this.preserved.forEach(listener);
  }
  push(...events) {
    const toStore = _.flatten(events).map((e) => { if (e instanceof Event) return e.toJson(); return e; });
    return db.rpushAsync(this.name, toStore);
  }
  updateSize() {
    return db.llenAsync(this.name)
    .then((size) => {
      if (this.size !== size) {
        if (size > this.index) {
          this.events.emit('behind',
            { size,
              behind: size - this.index,
              index: this.index,
              name: this.name,
              listen: listener => this.listenTo(listener),
            });
        } else {
          this.events.emit('up-to-date', { index: this.index, name: this.name, family: this.family() });
        }
      }
      this.size = size;
      return size;
    });
  }
  on(ev, l) {
    this.events.on(ev, l);
  }
  init() {
    this.updateSize()
    .then(() => {
      this.observe().then(() => {
        if (this.alive) {
          this.interval = setInterval(() => {
            this.updateSize()
            .then(() => this.observe());
          }, 2);
        }
      });
    });
  }
  observe() {
    const seed = this.index < this.size
    ? Promise.resolve()
    : Promise.reject(new Error('no-new-elements'));
    return seed.then(() => db.lrangeAsync(this.name, this.index, this.index + 50))
    .then((n) => { if (n.length === 0) { throw Error('no-new-elements'); } return n; })
    .then(elements => elements.map(JSON.parse))
    .then((raws) => {
      raws.forEach((raw) => {
        this.index = this.index + 1;
        if (raw.time > this.since) {
          const e = Event.of(raw, { source: this.name, index: this.index, family: this.family() });
          if (this.preserve) {
            this.preserved.push(e);
          }
          this.events.emit('event', e);
        }
      });
      if (this.index < this.size) {
        // console.log('fast seek', this.index, this.size);
        return this.observe();
      }
      this.events.emit('up-to-date', { index: this.index, name: this.name });
      return null;
    })
    .catch((e) => {
      switch (e.message) {
        case 'null':
          console.error(e);
          break;
        case 'no-new-elements':
          break;
        default:
          console.error(e);
      }
    });
  }
  destroy() {
    this.alive = false;
    if (this.interval) {
      this.interval.close();
      clearInterval(this.interval);
    }
    if (this.events) {
      this.events.removeAllListeners();
    }
    setTimeout(() => {
      delete this.preserved;
      delete this.events;
      delete this.interval;
    }, 30);
  }
};
