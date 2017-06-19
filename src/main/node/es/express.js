const express = require('express');
const ProjectionManager = require('./ProjectionManager');
const handler = require('./CommandHandler');

const app = express();
const manager = ProjectionManager();

app.use((req, res, next) => {
  req.manager = manager;
  req.projection = manager.projection.bind(manager);
  req.handle = cmd => handler.process(cmd, manager);
  next();
});

module.exports = app;
