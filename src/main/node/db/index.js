// eslint-disable-line
/* eslint global-require: "off"*/

module.exports = {
  user: require('./user'),
  level: require('./level'),
  db: require('./db').db,
};
