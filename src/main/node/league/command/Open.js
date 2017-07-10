const { AccessDeniedError } = require('../../es/command');
const { handler } = require('../../es');
const { Opened } = require('../events');
const ModeratorCommand = require('./ModeratorCommand');

module.exports = class Open extends ModeratorCommand {
  applicable({ league }) {
    if (league.open) {
      return new AccessDeniedError('Cannot close already opened league');
    }
    return super.applicable({ league });
  }
  events() { return [new Opened()]; }
  static declare() { return ['league']; }
};
handler.declare(module.exports);
