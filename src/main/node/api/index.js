const express = require('express');

const jwt = require('./jwt');
const github = require('./github');

const app = express();

const isAdmin = jwt.protectLevel('admin');

app.use('/_github', github);
app.use(jwt.protect);
app.get('/', isAdmin, (req, res) => {
  res.send('OK');
});

app.get('/owner', require('./owner'));
app.get('/users', isAdmin, require('./users'));

app.use('*', (req, res) => { res.status(404).send('Not Found'); });
module.exports = app;
