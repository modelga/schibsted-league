const config = require('../config').app;
const { user } = require('../db');

const setLevel = (req, res) => {
  if (req.user.id === config.ownerId) {
    user.setLevel(config.ownerId, 'admin');
    res.send('OK');
    return;
  }
  res.status(401).send('Unauthorized: You are not an owner');
};

module.exports = setLevel;
