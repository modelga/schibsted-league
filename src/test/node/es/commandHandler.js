/* eslint-env node, mocha */
const base = '../../../main/node';
require('../config');
require('should');
const Events = require('events');

class Projection extends Events {
  constructor(name, id) {
    super();
    this.name = name;
    this.id = id;
    this._state = { id };
    this.meta = {};
    this.meta[`es:${name}-${id}`] = 0;
    setImmediate(() => this.emit('state', this.state(), this));
  }
  handle(e) {
    if (this.name.indexOf(e.meta.family) !== -1) {
      this._state = e.payload;
      setImmediate(() => this.emit('state', this.state(), this));
    }
  }
  state() { return this._state; }
}
const stubProjection = (name, id) => new Projection(name, id);
const manager = { projection: (name, id) => Promise.resolve(stubProjection(name, id)) };

describe('CommandhHandler', () => {
  describe('@declare', () => require('./commandHandlerDeclare')());
  describe('@process', () => require('./commandHandlerProcess')(manager));
});
