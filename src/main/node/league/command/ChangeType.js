const ModeratorCommand = require('./ModeratorCommand');
const { handler } = require('../../es');
const { TypeChanged } = require('../events');

module.exports = class ChangeType extends ModeratorCommand {
  constructor(id, type) {
    super(id);
    this.type = type;
  }
  events() {
    return [new TypeChanged(this.type)];
  }
  static declare() {
    return ['league'];
  }
};
handler.declare(module.exports);
