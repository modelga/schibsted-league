const ModeratorCommand = require('./ModeratorCommand');
const { handler } = require('../../es');
const { NameChanged } = require('../events');

module.exports = class ChangeName extends ModeratorCommand {
  constructor(id, name) {
    super(id);
    this.name = name;
  }
  events() {
    return [new NameChanged(this.name)];
  }
  static declare() {
    return ['league'];
  }
};
handler.declare(module.exports);
