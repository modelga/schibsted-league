const { Command, AccessDeniedError, Type } = require('../../es/command');
const { handler } = require('../../es');
const { LeagueCreated, UserToLeagueAdded } = require('../events');
const cuid = require('cuid');

module.exports = class extends Command {
  constructor(owner, name, type, description) {
    super(cuid());
    this.owner = owner;
    this.name = name;
    this.type = type;
    this.description = description;
  }
  applicable({ league }) {
    if (league.state === 'pre-create') {
      return true;
    }
    throw new AccessDeniedError();
  }
  creatable() {
    return true;
  }
  custom(field, type) {
    if (field === 'userLeagues') {
      return this.owner;
    }
    return super.custom(field, type);
  }
  events() {
    return { league: [new LeagueCreated(this.owner, this.name, this.type, this.description)],
      userLeagues: [new UserToLeagueAdded(this.id)] };
  }
  static declare() {
    return ['league', { userLeagues: Type.Custom }];
  }
};

handler.declare(module.exports);
