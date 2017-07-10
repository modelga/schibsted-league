/* eslint global-require: "off"*/
const { ProjectionStorage, extend } = require('./projections/ProjectionStorage');
const _ = require('lodash');

module.exports = Object.assign({
  ProjectionStorage,
  extend,
  EventStorage: require('./EventStorage'),
  ProjectionManager: require('./ProjectionManager'),
  EventStream: require('./EventStream'),
  Stream: require('./Stream'),
}, require('./express'), require('./Event'));
