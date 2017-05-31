/* eslint-env node, mocha */
require('./config');
require('should');

const { user } = require('../../main/node/db');

describe('a test', () => {
  it('ds', (done) => {
    user.store({ id: 'amm', some: 'one' });
    user.store({ id: 'lamm', some: 'one' });
    user.list().then((l) => {
      done();
    });
  });
});
