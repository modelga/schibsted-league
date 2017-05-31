const { toJson } = require('../db/db');


class Event {
  constructor(name, payload, time, meta) {
    this.name = name;
    this.payload = payload || {};
    this.time = time || new Date().getTime();
    this.meta = meta || {};
  }
  static of(input, meta) {
    return new Event(input.name, input.payload, input.time, meta);
  }
  toJson() {
    return toJson(Object.assign({}, this, { meta: undefined }));
  }
}
module.exports = { Event };
