const { AccessDeniedError, Type } = require('../../es/command');
const { handler } = require('../../es');
const Events = require('../events');
const Ex = require('../exceptions');
const ModeratorCommand = require('./ModeratorCommand');

module.exports = class AddMatch extends ModeratorCommand {
  constructor(id, { home, away }) {
    super(id);
    this.home = home;
    this.away = away;
  }
  events() {
    return [];
  }
  applicable({ league }) {
    if (league.state !== 'ongoing') {
      throw new Ex.BadRequest('Cannot add match on not going tournament');
    }
    if ([this.home.player, this.away.player].indexOf(this.requester) !== -1) {
      return true;
    }
    return super.applicable({ league });
  }
  static declare() {
    return ['league', { table: Type.AggregateId, allowCreate: true }];
  }
};
handler.declare(module.exports);
