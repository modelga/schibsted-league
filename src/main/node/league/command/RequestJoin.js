const { AccessDeniedError, Type, Command } = require('../../es/command');
const { handler } = require('../../es');
const Events = require('../events');
const ModeratorCommand = require('./ModeratorCommand');
const _ = require('lodash');
const Ex = require('../exceptions');

module.exports = class RequestJoin extends ModeratorCommand {
  constructor(id, player) {
    super(id);
    this.player = player;
  }
  events() {
    return [new Events.PlayerAdded(this.player)];
  }
  applicable({ league }) {
    if (league.open) {
      if (_.find(league.players, p => p.id === this.player.id)) {
        throw new Ex.NotModified('already exists');
      }
      return true;
    }
    return super.applicable({ league });
  }
  static declare() {
    return ['league', { table: Type.AggregateId, allowCreate: true }];
  }
};
handler.declare(module.exports);
