const config = require('../config').app;
const { user } = require('../db');

const setLevel = (req, res) => {
  user.list().then(list => res.send(list));
};

module.exports = setLevel;
