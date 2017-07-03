const { Event } = require('../es');

module.exports.LeagueCreated = class extends Event {
  constructor(owner, name, type, description) {
    super('created', { owner, name, type, description });
  }
};

module.exports.LeaguePlayerJoined = class extends Event {
  constructor(user, team) {
    super('playerJoined', { user, team });
  }
};
module.exports.UserToLeagueAdded = class extends Event {
  constructor(id) {
    super('userToLeagueAdded', { id });
  }
};

module.exports.DescriptionChanged = class extends Event {
  constructor(description) {
    super('descriptionChanged', { description });
  }
};

module.exports.NameChanged = class extends Event {
  constructor(name) {
    super('nameChanged', { name });
  }
};
