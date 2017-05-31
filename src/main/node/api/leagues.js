const express = require('express');

const app = express.Router();

app.get('/:id', (req, res) => {
  console.log(req.projection('league', req.params.id));
  res.send('ok');
});

app.get('/', (req, res) => {
  console.log(req.projection('league', req.params.id));
  res.send('ok');
});
module.exports = app;
