/* eslint class-methods-use-this: "off"*/

const { ProjectionStorage } = require('./ProjectionStorage');

class LeagueProjection extends ProjectionStorage {
  constructor(aggregateId) {
    super('league', aggregateId);
  }
  initialState() {
    return { state: 'pre-create', open: false, public: false };
  }
  handleCreated(state, payload) {
    return Object.assign({}, state, { state: 'created', name: payload.name, type: payload.type });
  }
  handlePlayerJoined(state, payload) {
    const players = state.players || [];
    const toAdd = { state: 'requesting', id: payload.user, team: payload.team };
    return Object.assign({}, state, { players: players.concat(toAdd) });
  }
}

module.exports = LeagueProjection;
