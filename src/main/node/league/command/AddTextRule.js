const { handler } = require('../../es');
const { RuleAdded } = require('../events');
const cuid = require('cuid');
const ModeratorCommand = require('./ModeratorCommand');

module.exports = class extends ModeratorCommand {
  constructor(id, rule) {
    super(id);
    this.ruleId = cuid();
    this.rule = rule;
  }
  events() {
    return [new RuleAdded(this.ruleId, this.rule)];
  }
  static declare() {
    return ['league'];
  }
};
handler.declare(module.exports);
