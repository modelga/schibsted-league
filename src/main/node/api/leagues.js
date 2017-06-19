const express = require('express');

const app = express.Router();

app.get('/:id', (req, res) => {
  req.projection('league', req.params.id)
    .then(p => res.send(p.state()))
    .catch(req.manager.NotExists, () => res.status(404).send('Not Found'));
});

module.exports = app;
