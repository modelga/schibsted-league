/* eslint-env node, mocha */
const base = '../../../main/node';

require('../config');
require('should');
const _ = require('lodash');

const { db, toJson } = require(`${base}/db/db`);
const { league } = require(`${base}/es/projections`).factories;
const LeagueProjection = require(`${base}/es/projections/LeagueProjection`);
const events = require(`${base}/es/events/league`);


describe('League', () => {
  let proj;
  before((done) => {
    db.delAsync('proj:league-1').then(() => {
      league(1).once('ready', (p) => {
        proj = p;
        done();
      });
    });
  });
  after(done => proj.destroy(done));
  it('should be instance of league', (done) => {
    league(1).once('ready', (l) => {
      l.should.be.instanceOf(LeagueProjection);
      l.state().should.match({ state: 'pre-create' }); // should be at-least in pre-create state
      l.destroy(done);
    });
  });

  it('should handle league create', (done) => {
    proj.handle(new events.LeagueCreated('Schibsted', '1vs1'))
      .then((state) => {
        state.should.match({ name: 'Schibsted', type: '1vs1', state: 'created' });
        done();
      }).catch(done);
  });

  it('should handle league join', (done) => {
    proj.handle(new events.LeaguePlayerJoined('github:1', 'Barcelona'))
      .then((state) => {
        state.should.match({
          name: 'Schibsted',
          type: '1vs1',
          state: 'created',
          players: [{ id: 'github:1', team: 'Barcelona', state: 'requesting' }] });
        done();
      }).catch(done);
  });
});
