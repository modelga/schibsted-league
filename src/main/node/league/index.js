/* eslint-disable global-require*/
require('./UserLeague');
require('./League');
require('./PublicLeagues');
require('./Table');

module.exports = Object.assign(
  {},
  require('./command'),
  { events: require('./events'),
    exceptions: require('./exceptions'),
  });
