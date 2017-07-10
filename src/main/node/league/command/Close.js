const { AccessDeniedError } = require('../../es/command');
const { handler } = require('../../es');
const { Closed } = require('../events');
const ModeratorCommand = require('./ModeratorCommand');

module.exports = class Close extends ModeratorCommand {
  applicable({ league }) {
    if (!league.open) {
      return new AccessDeniedError('Cannot close already closed league');
    }
    return super.applicable({ league });
  }
  events() {
    return [new Closed()];
  }
  static declare() {
    return ['league'];
  }
};
handler.declare(module.exports);
