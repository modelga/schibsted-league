/* eslint class-methods-use-this: "off"*/

const { manager, ProjectionStorage } = require('../es');

class League extends ProjectionStorage {
  constructor(aggregateId) {
    super('league', aggregateId);
  }
  initialState() {
    return { state: 'pre-create',
      open: false,
      public: false,
      players: [],
      type: '1vs1',
      completed: false,
      name: '',
      rules: [],
      description: '',
      table: [],
      owner: null,
      moderators: [] };
  }
  handleCreated(state, { name, type, owner, description }) {
    return Object.assign({}, state,
      {
        state: 'created',
        name,
        description,
        type,
        owner,
        moderators: state.moderators.concat(owner),
      },
    );
  }
  handleDescriptionChanged(state, { description }) {
    return Object.assign({}, state, { description });
  }
  handleNameChanged(state, { name }) {
    return Object.assign({}, state, { name });
  }
  handlePlayerJoined(state, payload) {
    const players = state.players || [];
    const toAdd = { state: 'requesting', id: payload.user, team: payload.team };
    return Object.assign({}, state, { players: players.concat(toAdd) });
  }
}
manager.declare('league', League);
module.exports = League;
