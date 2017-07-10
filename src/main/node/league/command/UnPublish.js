const { AccessDeniedError, Type } = require('../../es/command');
const { handler } = require('../../es');
const E = require('../events');
const ModeratorCommand = require('./ModeratorCommand');

module.exports = class UnPublish extends ModeratorCommand {
  applicable({ league }) {
    if (!league.public) {
      return new AccessDeniedError('Cannot unpublish already private league!');
    }
    return super.applicable({ league });
  }
  events() {
    return [new E.UnPublished(this.id)];
  }
  static declare() {
    return ['league', { publicLeagues: Type.Single }];
  }
};
handler.declare(module.exports);
