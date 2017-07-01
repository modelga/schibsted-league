/* eslint-disable global-require*/

module.exports = Object.assign({}, {
  Projection: require('./LeagueProjection'),
}, require('./command'), require('./events'));
