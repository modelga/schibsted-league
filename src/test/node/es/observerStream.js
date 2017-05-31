/* eslint-env node, mocha */
const base = '../../../main/node';

require('../config');
require('should');
const _ = require('lodash');

const { db, toJson } = require(`${base}/db/db`);

const { ObserveStream } = require(`${base}/es`);

describe('ObserveStream', () => {
  before((done) => {
    const payload = {};
    const data = {
      'es:league-2': [
      { name: 'created', time: 1, payload },
      { name: 'hate', time: 2, payload },
      { name: 'round', time: 3, payload },
      { name: 'found', time: 5, payload },
      ],
    };
    Promise.all(_.keys(data).map(s => db.delAsync(s)))
    .then(() => _.map(data, (events, es) => db.rpushAsync(...[es].concat(events.map(toJson)))))
    .then(e => Promise.all(e))
    .then(() => done());
  });

  it('instance created', (done) => {
    const stream = new ObserveStream('es:league-2', 0, () => { });
    stream.should.be.instanceOf(ObserveStream);
    setTimeout(() => { stream.destroy(); done(); }, 1);
  });
  it('passed listener should receive predefined messages created', (done) => {
    const stream = new ObserveStream('es:league-2', 0, (e) => {
      if (e.time === 5) {
        done();
        stream.destroy();
      }
    });
  });
  it('should receive future message', (done) => {
    const newEvent = { time: 6 };
    const stream = new ObserveStream('es:league-2', 0, (e) => {
      if (e.time === 6) {
        done();
        stream.destroy();
      }
    });
    db.rpush('es:league-2', toJson(newEvent));
  });

  it('should receive future on new listener', (done) => {
    const newEvent = { time: 7 };
    const stream = new ObserveStream('es:league-2', 0, (e) => {
      if (e.time === 6) {
        done();
        stream.destroy();
      }
    });
    db.rpush('es:league-2', toJson(newEvent));
  });


  it('should receive message basing on specific index', (done) => {
    let count = 0; // current total events is 6, basing on index 4, so 2 events should be processed
    const stream = new ObserveStream('es:league-2', { index: 4 }, () => { count += 1; });
    setTimeout(() => {
      if (count === 2) {
        done();
      } else {
        done(new Error(`Expected only 2 events to be processed got ${count}`));
      }
      stream.destroy();
    }, 2); // check
  });

  it('should receive event up-to-date', (done) => {
    const stream = new ObserveStream('es:league-2', { index: 4 }, () => { });
    stream.on('up-to-date', ((meta) => {
      meta.name.should.equal('es:league-2');
      meta.index.should.equal(6);
      stream.destroy();
      done();
    }));
  });
});
