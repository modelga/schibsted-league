const { AccessDeniedError, Type } = require('../../es/command');
const { handler } = require('../../es');
const ModeratorCommand = require('./ModeratorCommand');
const E = require('../events');
const Ex = require('../exceptions');

module.exports = class StartLeague extends ModeratorCommand {
  applicable({ league }) {
    if (league.state !== 'created') {
      throw new Ex.BadRequest('Cannot start league not in created state');
    }
    if (league.players.length < 2) {
      throw new Ex.BadRequest('Cannot start league with only 1 player');
    }
    return super.applicable({ league });
  }
  events() { return [new E.Started()]; }
  static declare() {
    return ['league'];
  }
};
handler.declare(module.exports);
