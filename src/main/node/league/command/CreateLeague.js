const { Command, AccessDeniedError } = require('../../es/command');
const { handler } = require('../../es');
const { LeagueCreated } = require('../events');
const cuid = require('cuid');

class CreateLeague extends Command {
  constructor(owner, name, type) {
    super(cuid());
    this.owner = owner;
    this.name = name;
    this.type = type;
  }
  applicable({ league }) {
    if (league.state === 'pre-create') {
      return true;
    }
    throw new AccessDeniedError();
  }
  events() {
    return [new LeagueCreated(this.owner, this.name, this.type)];
  }
  static declare() {
    return { es: ['league'], proj: ['league'] };
  }
}

handler.declare(CreateLeague);

module.exports = CreateLeague;
