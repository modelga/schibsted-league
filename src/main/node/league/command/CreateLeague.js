const { Command, AccessDeniedError, Type } = require('../../es/command');
const { handler } = require('../../es');
const { LeagueCreated } = require('../events');
const cuid = require('cuid');

module.exports = class extends Command {
  constructor(p) {
    if (!p.owner || !p.name || !p.type || !p.description) {
      throw new Error('Lack of expected params', p);
    }
    super(cuid());
    this.payload = Object.assign({}, p, { id: this.id });
  }
  applicable({ league }) {
    if (league.state === 'pre-create') {
      return true;
    }
    throw new AccessDeniedError();
  }
  creating() {
    return true;
  }
  custom(field, type) {
    if (field === 'userLeagues') {
      return this.owner;
    }
    return super.custom(field, type);
  }
  events() {
    return { league: [new LeagueCreated(this.payload)], leagues: new LeagueCreated({ id: this.id }) };
  }
  static declare() {
    return ['league', { userLeagues: Type.Custom }];
  }
};

handler.declare(module.exports);
