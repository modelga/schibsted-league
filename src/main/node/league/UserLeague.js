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
  handleUserToLeagueAdded(state, { id }) {
    return Object.assign({}, state, { current: _.uniq(state.current.concat(id)) });
  }
  handleLeagueComplete(state, { id }) {
    return Object.assign({}, state);
  }
}
manager.declare('userLeagues', UserLeagues);
module.exports = UserLeagues;
