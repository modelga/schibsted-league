const { toJson } = require('../db/db');
const cuid = require('cuid');
const _ = require('lodash');

class Event {
  constructor(name, payload, time, meta) {
    this.eventId = (meta || {}).id || cuid(); // create id or use id from meta
    this.name = name;
    this.payload = payload || {};
    this.time = time || new Date().getTime();
    this.meta = meta || {};
  }
  get id() {
    return this.eventId;
  }
  static of(input, meta) {
    return new Event(input.name, input.payload, input.time, meta);
  }
  toJson() {
    return toJson(Object.assign({}, this, { meta: undefined }));
  }
}

const simple = (name, ...keys) => class extends Event {
  constructor(...args) {
    if (args.length !== keys.length) {
      console.log(args);
      throw Error(`Command '${name}' creation failed: List of defined keys(${keys}) doesn't args (${args})`);
    }
    const payload = _.fromPairs(keys.map((k, index) => [k, args[index]]));
    super(name, payload);
  }
};

const constructorPayload =
  name => class extends Event {
    constructor(payload) {
      super(name, payload);
    }
  };

module.exports = { Event, simple, constructorPayload };
