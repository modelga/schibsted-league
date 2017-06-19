/* eslint global-require: "off"*/

const as = function (Class) { return (id => new Class(id)); };
const { ProjectionStorage, NotExists } = require('./ProjectionStorage');

module.exports = {
  factories: {
    league: as(require('./LeagueProjection')),
  },
  exists: ProjectionStorage.exists,
  ProjectionStorage,
  NotExists,
};
