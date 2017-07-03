/* eslint-disable global-require*/

module.exports = Object.assign({}, {
  League: require('./League'),
  UserLeague: require('./UserLeague'),
}, require('./command'), require('./events'));
