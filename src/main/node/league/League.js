/* eslint class-methods-use-this: "off"*/
const _ = require('lodash');

const { manager, ProjectionStorage } = require('../es');

class League extends ProjectionStorage {
  constructor(aggregateId) {
    super('league', aggregateId);
  }
  initialState() {
    return { state: 'pre-create',
      id: null,
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
  handleCreated(extend, create, { moderators }) {
    return extend(create, {
      state: 'created',
      moderators: moderators.concat(create.owner),
    });
  }
  handleDescriptionChanged(extend, { description }) {
    return extend({ description });
  }
  handleNameChanged(extend, { name }) {
    return extend({ name });
  }
  handlePlayerJoined(extend, payload, { players }) {
    const toAdd = { state: 'requesting', id: payload.user, team: payload.team };
    return extend({ players: players.concat(toAdd) });
  }
  handleOpened(extend) { return extend({ open: true }); }
  handleClosed(extend) { return extend({ open: false }); }

  handleRuleAdded(extend, rule, state) {
    return extend({ rules: state.rules.concat(rule) });
  }
  handleRuleDiscarded(extend, { id }, state) {
    return extend({ rules: state.rules.filter(r => r.id !== id) });
  }
  handlePublished(extend) { return extend({ public: true }); }
  handleStarted(extend) { return extend({ state: 'ongoing' }); }
  handleTypeChanged(extend, { type }) { return extend({ type }); }
  handleUnPublished(extend) { return extend({ public: false }); }
  handlePlayerAdded(extend, player, { players }) {
    return extend({ players: players.concat(player) });
  }
  handleTeamUpdated(extend, { id, team }, { players }) {
    const player = Object.assign({}, _.find(players, p => p.id === id), { team: team.team, rate: team.rate });
    const newPlayers = _.filter(players, p => p.id !== id).concat(player);
    return extend({ players: newPlayers });
  }
}

manager.declare('league', League);
module.exports = League;
