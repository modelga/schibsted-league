const express = require('express');

const config = require('./config');

const app = express();
app.use(require('./es').express);

app.use('/api', require('./api'));

if (config.env === 'dev') {
  // eslint-disable-next-line
  const proxy = require('express-http-proxy');
  app.use(proxy('http://localhost:8080'));
} else {
  app.use(express.static('static'));
}
app.listen(config.http.port, () => {
  console.log(`Listening on ${config.http.port}`);
});
