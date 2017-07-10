/* eslint class-methods-use-this: "off"*/
const _ = require('lodash');
const { manager, ProjectionStorage } = require('../es');

module.exports = class PublicLeagues extends ProjectionStorage {
  constructor(aggregateId) {
    super('publicLeagues', aggregateId);
  }
  initialState() {
    return {
      list: [],
    };
  }
  handlePublished(extend, { id }, { list }) {
    return extend({ list: _.uniq(list.concat(id)) });
  }
  handleUnPublished(extend, { id }, { list }) {
    return extend({ list: _.filter(list, l => l !== id) });
  }
};
manager.declare('publicLeagues', module.exports);
