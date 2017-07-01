const express = require('express');
const ProjectionManager = require('./ProjectionManager');
const { CommandHandler } = require('./command');

const handler = new CommandHandler();
const plugin = new express.Router();
const manager = ProjectionManager();

plugin.use((req, res, next) => {
  req.manager = manager;
  req.projection = manager.projection.bind(manager);
  req.handle = cmd => handler.process(cmd, manager);
  next();
});

module.exports = { handler, express: plugin, manager };
