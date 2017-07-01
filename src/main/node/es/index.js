/* eslint global-require: "off"*/
const { ProjectionStorage } = require('./projections/ProjectionStorage');

module.exports = Object.assign({
  ProjectionStorage,
  EventStorage: require('./EventStorage'),
  ProjectionManager: require('./ProjectionManager'),
  EventStream: require('./EventStream'),
  Stream: require('./Stream'),
}, require('./express'), require('./Event'));
