const ModeratorCommand = require('./ModeratorCommand');
const { handler } = require('../../es');
const E = require('../events');

module.exports = class ChangeTeam extends ModeratorCommand {
  constructor(id, { player, team }) {
    super(id);
    if (!player || !team || !team.team || !team.rate) {
      throw new Error('undefined fields');
    }
    Object.assign(this, { player, team });
  }
  applicable({ league, table }) {
    return true;
  }
  events() {
    return [new E.TeamUpdated(this.player, this.team)];
  }
  static declare() {
    return ['league', 'table'];
  }
};
handler.declare(module.exports);
