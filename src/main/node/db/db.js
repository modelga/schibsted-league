const config = require('../config').redis;

const bluebird = require('bluebird');
const redis = require('redis');

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

const client = redis.createClient(`redis://${config.host}:${config.port}`);

client.on('error', (err) => {
  console.log(`Error ${err}`);
});

class NotFound extends Error {}

const notFound = why => (e) => {
  if (e !== null) {
    return e;
  }
  throw new NotFound(why || 'not-found');
};

const toJson = (e) => {
  switch (typeof e) {
    case 'object':
      return JSON.stringify(e);
    case 'string':
      return e;
    default:
      console.error(`Unable to parse as JSON (${typeof e}) ${e} `);
      return '{}';
  }
};

const asJson = (e) => {
  switch (typeof e) {
    case 'string':
      return JSON.parse(e);
    default:
      return e;
  }
};

client.on('connect', () => {
  console.log(`Connected to ${config.host}:${config.port}`);
});


module.exports = { db: client, notFound, asJson, toJson };
