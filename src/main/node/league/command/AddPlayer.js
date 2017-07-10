const { AccessDeniedError, Type } = require('../../es/command');
const { handler } = require('../../es');
const Events = require('../events');
const ModeratorCommand = require('./ModeratorCommand');

module.exports = class AddPlayer extends ModeratorCommand {
  constructor(id, player) {
    super(id);
    this.player = player;
  }
  events() {
    return [new Events.PlayerAdded(this.player)];
  }
  applicable({ league, table }) {
    if (table.list.filter(p => p.id === this.player.id).length > 0) {
      return false;
    }
    return super.applicable({ league });
  }
  static declare() {
    return ['league', { table: Type.AggregateId, allowCreate: true }];
  }
};
handler.declare(module.exports);
