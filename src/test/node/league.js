/* eslint-env node, mocha */
const base = '../../main/node';

require('./config');
const { handle } = require(`${base}/es`);
const { CreateLeague } = require(`${base}/league`);
// league
const owner = 'gh:1';
const name = 'Fancy Schibsted League';
const type = '1vs1';

describe('league commands', () => {
  const create = new CreateLeague(owner, name, type);
  const id = create.id;
  it('can be created', () => handle(create)
    .then(({ league }) => {
      console.log(league);
    }));
  it('should fail if try to create using the same id', () => handle(create));
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
