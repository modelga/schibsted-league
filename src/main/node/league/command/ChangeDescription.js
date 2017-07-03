const { Command, AccessDeniedError, Type } = require('../../es/command');
const { handler } = require('../../es');
const { DescriptionChanged } = require('../events');

module.exports = class extends Command {
  constructor(id, description) {
    super(id);
    this.description = description;
  }
  applicable({ league }) {
    if (league.completed) {
      return new AccessDeniedError();
    }
    return true;
  }
  events() {
    return [new DescriptionChanged(this.description)];
  }
  static declare() {
    return ['league'];
  }
};

handler.declare(module.exports);
