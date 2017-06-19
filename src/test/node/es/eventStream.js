/* eslint-env node, mocha */
const base = '../../../main/node';
require('../config');
require('should');
const _ = require('lodash');

const { db, toJson } = require(`${base}/db/db`);
const { EventStream } = require(`${base}/es/EventStream`);

describe('EventStream', () => {
  before((done) => {
    const payload = {};
    const data = {
      'es:league-1': [
      { name: 'created', time: 1, payload },
      { name: 'make', time: 2, payload },
      ],
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

  describe('should set-up event stream', () => {
    it('instance created', (done) => {
      const stream = new EventStream();
      stream.should.be.instanceOf(EventStream);
      setTimeout(() => { stream.destroy(); done(); }, 10);
    });

    it('listen on events', (done) => {
      let events = 0;
      const stream = new EventStream();
      stream.events(() => {
        if (++events === 6) { // eslint-disable-line
          stream.destroy();
          done();
        }
      });
    });

    it('listen watch on new events', (done) => {
      const stream = new EventStream();
      stream.events((e) => {
        if (e.meta.source === 'es:league-2' && e.payload === 'thisEvent') {
          stream.destroy();
          done();
        }
      });
      db.rpush('es:league-2', toJson({ name: 'found', time: 5, payload: 'thisEvent' }));
    });

    it('listen on events with defined meta', (done) => {
      let ev1 = 0;
      let ev2 = 0;
      const meta = { 'es:league-1': { index: 1 }, 'es:league-2': { index: 2 } };
      const stream = new EventStream(meta, 'es:league-1,es:league-2');
      const fail = setTimeout(() => {
        stream.destroy();
        done(new Error(`Failing got ${ev1 + ev2} events`));
      }, 4);
      stream.events((e) => {
        if (e.meta.source === 'es:league-1') ev1++;
        if (e.meta.source === 'es:league-2') ev2++;
        if (ev1 === 1 && ev2 === 3) { // eslint-disable-line
          stream.destroy();
          clearTimeout(fail);
          done();
        }
      });
    });
    it('listen on up-to-date', (done) => {
      const meta = { 'es:league-1': { index: 2 }, 'es:league-2': { index: 2 } };
      const stream = new EventStream(meta, 'es:league-1,es:league-2');
      const fail = setTimeout(() => {
        stream.destroy();
        done(new Error('Failed after 20 ms'));
      }, 20);
      stream.stream.once('up-to-date', (e) => {
        stream.destroy();
        clearTimeout(fail);
        done();
      });
      stream.start();
    });
  });

  after(() => {
  });
});
