const { app } = require('./app');

const config = require('./config');

app.listen(config.http.port, () => {
  console.log(`Listening on ${config.http.port}`);
});
