/* eslint-env node, mocha */
const base = '../../main/node';

require('should');

const { reset } = require('./config');

const { handle } = require(`${base}/es`);
const { AccessDeniedError } = require(`${base}/es/command`);
const { CreateLeague, ChangeDescription, ChangeName } = require(`${base}/league`);
// league
const owner = 'gh:1';
const name = 'Fancy Schibsted League';
const description = `${name}-desc`;
const type = '1vs1';

describe('league commands', () => {
  const create = new CreateLeague(owner, name, type, description);
  const id = create.id;
  it('can be created',
    () => handle(create)
      .then(({ league, userLeagues }) => {
        league.should.match({
          state: 'created',
          owner: create.owner,
          description,
          completed: false,
          moderators: [create.owner],
          name: create.name,
          type: create.type,
        });
        userLeagues.current.should.matchAny(id);
        userLeagues.current.should.have.size(1);
      }));

  it('should fail if try to create using the same id',
    () => handle(create).should.be.rejectedWith(AccessDeniedError));

  describe('meta changes', () => {
    it('can change description',
      () => handle(new ChangeDescription(id, 'a new description'))
        .then(({ league }) => {
          league.description.should.equal('a new description');
        }),
    );
    it('can change name',
      () => handle(new ChangeName(id, 'new name'))
        .then(({ league }) => {
          league.name.should.equal('new name');
        }),
    );
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

  after(reset);
});
