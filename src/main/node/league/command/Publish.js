const { AccessDeniedError, Type } = require('../../es/command');
const { handler } = require('../../es');
const ModeratorCommand = require('./ModeratorCommand');
const E = require('../events');

module.exports = class Publish extends ModeratorCommand {
  applicable({ league }) {
    if (league.public) {
      return new AccessDeniedError('Cannot publish already public league');
    }
    return super.applicable({ league });
  }
  events() { return [new E.Published(this.id)]; }
  static declare() {
    return ['league', { publicLeagues: Type.Single, allowCreate: true }];
  }
};
handler.declare(module.exports);
