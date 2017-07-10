/* eslint class-methods-use-this: "off"*/
const _ = require('lodash');
const { manager, ProjectionStorage } = require('../es');

const name = 'table';

const addBase = p => Object.assign({}, p, {
  matches: 0,
  wins: 0,
  loses: 0,
  points: 0,
});

module.exports = class PublicLeagues extends ProjectionStorage {
  constructor(aggregateId) {
    super(name, aggregateId);
  }
  initialState() {
    return {
      list: [],
    };
  }
  handlePlayerAdded(extend, player, { list }) {
    return extend({ list: _.uniq(list.concat(addBase(player))) });
  }

  handleTeamUpdated(extend, { id, team }, { list }) {
    const player = Object.assign({}, _.find(list, p => p.id === id), { team: team.team, rate: team.rate });
    const newList = _.filter(list, p => p.id !== id).concat(player);
    return extend({ list: newList });
  }
};
manager.declare(name, module.exports);
