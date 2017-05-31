const express = require('express');
const ProjectionManager = require('./ProjectionManager');

const app = express();
const manager = ProjectionManager();

app.use((req, res, next) => {
  req.manager = manager;
  req.projection = manager.projection.bind(manager);
  next();
});

module.exports = app;
