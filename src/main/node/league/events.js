const { Event } = require('../es');

class LeagueCreated extends Event {
  constructor(owner, name, type) {
    super('created', { owner, name, type });
  }
}

class LeaguePlayerJoined extends Event {
  constructor(user, team) {
    super('playerJoined', { user, team });
  }
}
module.exports = { LeagueCreated, LeaguePlayerJoined };
