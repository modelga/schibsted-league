const { AccessDeniedError, Type } = require('../../es/command');
const { handler } = require('../../es');
const ModeratorCommand = require('./ModeratorCommand');
const E = require('../events');

module.exports = class StartLeague extends ModeratorCommand {
  applicable({ league }) {
    if (league.state !== 'create') {
      return new AccessDeniedError('Cannot start league not in create state');
    }
    if (league.players.length < 2) {
      return new AccessDeniedError('Cannot start league with only 1 player');
    }
    return super.applicable({ league });
  }
  events() { return [new E.Started()]; }
  static declare() {
    return ['league'];
  }
};
handler.declare(module.exports);
