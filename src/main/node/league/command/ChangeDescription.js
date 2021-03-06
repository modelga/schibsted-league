const { handler } = require('../../es');
const ModeratorCommand = require('./ModeratorCommand');
const { DescriptionChanged } = require('../events');

module.exports = class extends ModeratorCommand {
  constructor(id, description) {
    super(id);
    this.description = description;
  }
  events() {
    return [new DescriptionChanged(this.description)];
  }
  static declare() {
    return ['league'];
  }
};

handler.declare(module.exports);
