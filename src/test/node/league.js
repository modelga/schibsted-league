/* eslint-env node, mocha */
const base = '../../main/node';

require('./config');
const { handler, manager } = require(`${base}/es`);
require(`${base}/league/LeagueProjection`);
// league

describe('league commands', () => {
  manager.findOrCreateProjection('league', 1);
  it('can be created');
  describe('meta changes', () => {
    it('can change description');
    it('can change name');
  });
  describe('state of open', () => {
    it('can make league open');
    it('can make league closed again');
  });
  describe('rules management', () => {
    it('can add text rule');
    it('can make league public');
    it('can make league private again');
    it('can change type');
  });
  describe('player management', () => {
    it('can add player');
    it('can change player team');
  });
  describe('prevent actions before run', () => {
    it('prevent adding match if league is not ongoing');
  });
  describe('run the tournament', () => {
    it('run the tournament');
    it('fail when try to run again');
    it('terminate the tournament');
  });
  describe('matches', () => {
    it('can add match');
    it('can update the match');
  });
});
