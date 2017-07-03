/* eslint-env node, mocha */

const config = require('../../main/node/config');

Object.assign(config, { redis: Object.assign({}, config.redis, { port: 5678 }) });

const dbModule = require('../../main/node/db/db');

dbModule.db.quit();
const bluebird = require('bluebird');
const redis = require('redis-mock');

Object.assign(dbModule, { db: redis.createClient() });

bluebird.promisifyAll(Object.getPrototypeOf(dbModule.db));

module.exports = { config,
  reset: () => {
    redis.removeAllListeners();
    return dbModule.db.keysAsync('*')
      .then(keys => Promise.all((keys || []).map(k => dbModule.db.delAsync(k))));
  } };
