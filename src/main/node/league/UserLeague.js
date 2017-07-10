/* eslint class-methods-use-this: "off"*/
const _ = require('lodash');
const { manager, ProjectionStorage } = require('../es');

class UserLeagues extends ProjectionStorage {
  constructor(aggregateId) {
    super('userLeagues', aggregateId);
  }
  initialState() {
    return {
      current: [],
      old: [],
    };
  }
  handleCreated(extend, { id }, { current }) {
    return extend({ current: _.uniq(current.concat(id)) });
  }
  handleLeagueCompleted(extend, { id }, { current, old }) {
    return extend({
      current: _.filter(current, c => c !== id),
      old: _.uniq(old.concat(id)),
    });
  }
}
manager.declare('userLeagues', UserLeagues);
module.exports = UserLeagues;
