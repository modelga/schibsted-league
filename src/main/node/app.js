const express = require('express');

const config = require('./config');

const app = express();
app.use(require('./es').express);
app.use('/api', require('./api'));

app.use('/health', (req, res) => {
  const ts = Date.now();
  setImmediate(() => {
    res.status(200).send({ delay: Date.now() - ts });
  });
});

if (config.env === 'dev') {
  // eslint-disable-next-line
  const proxy = require('express-http-proxy');
  app.use(proxy('http://localhost:8080'));
} else {
  app.use(express.static('static'));
}

module.exports = Object.assign({}, { app }, require('./es'));
