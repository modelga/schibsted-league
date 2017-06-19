/* eslint global-require: "off"*/
const { Event } = require('./Event');

module.exports = {
  Event,
  EventStorage: require('./EventStorage'),
  ProjectionManager: require('./ProjectionManager'),
  EventStream: require('./EventStream'),
  Stream: require('./Stream'),
  express: require('./express'),
};
