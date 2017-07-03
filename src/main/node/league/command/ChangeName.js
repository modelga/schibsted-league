const { Command, AccessDeniedError, Type } = require('../../es/command');
const { handler } = require('../../es');
const { NameChanged } = require('../events');

module.exports = class ChangeName extends Command {
  constructor(id, name) {
    super(id);
    this.name = name;
  }
  applicable({ league }) {
    if (league.completed) {
      return new AccessDeniedError();
    }
    return true;
  }
  events() {
    return [new NameChanged(this.name)];
  }
  static declare() {
    return ['league'];
  }
};
handler.declare(module.exports);
