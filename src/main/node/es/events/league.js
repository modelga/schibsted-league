const { Event } = require('../Event');

class LeagueCreated extends Event {
  constructor(name, type) {
    super('created', { name, type });
  }
}

class LeaguePlayerJoined extends Event {
  constructor(user, team) {
    super('playerJoined', { user, team });
  }
}
module.exports = { LeagueCreated, LeaguePlayerJoined };
