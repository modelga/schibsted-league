const { Command, AccessDeniedError } = require('../../es/command');

module.exports = class ModeratorCommand extends Command {
  constructor({ id, requester }) {
    super(id);
    if (!requester) {
      throw new Error('No requester info');
    }
    this.requester = requester;
  }
  applicable({ league }) {
    if (!league || league.moderators.indexOf(this.requester) === -1) {
      throw new AccessDeniedError(`Not found ${this.requester} on list of moderators`);
    }
    if (league.completed) {
      return new AccessDeniedError('Cannot modify completed (finshed) leagues');
    }
  }
};
