/* eslint-env node, mocha */
const base = '../../main/node';

require('should');

const { reset } = require('./config');

const { handle } = require(`${base}/es`);
const { AccessDeniedError } = require(`${base}/es/command`);
const L = require(`${base}/league`);
// league
const owner = 'gh:1';
const requester = owner;
const otherPerson = 'gh:2';
const name = 'Fancy Schibsted League';
const description = `${name}-desc`;
const type = '1vs1';

describe('league commands', () => {
  const create = new L.CreateLeague({ owner, name, type, description });
  const id = create.id;
  const authorizedChange = { id, requester };
  it('can be created',
    () => handle(create)
      .then(({ league, userLeagues }) => {
        league.should.match({
          state: 'created',
          owner,
          open: false,
          description,
          completed: false,
          moderators: [owner],
          name,
          type,
          id,
        });
        userLeagues.current.should.matchAny(id);
        userLeagues.current.should.have.size(1);
      }));
  it('should fail if try to create using the same id',
    () => handle(create).should.be.rejectedWith(AccessDeniedError));

  describe('meta changes', () => {
    const newDescription = 'a new description';
    it('can change description',
      () => handle(new L.ChangeDescription(authorizedChange, newDescription))
        .then(({ league }) => {
          league.description.should.equal(newDescription);
        }),
    );
    it('can change name',
      () => handle(new L.ChangeName(authorizedChange, 'new name'))
        .then(({ league }) => {
          league.name.should.equal('new name');
        }),
    );
    it('can make league public',
      () => handle(new L.Publish(authorizedChange))
      .then(({ league, publicLeagues }) => {
        league.public.should.equal(true);
        publicLeagues.list.should.matchAny(id);
      }));
    it('can make league private again',
      () => handle(new L.UnPublish(authorizedChange))
      .then(({ league, publicLeagues }) => {
        league.public.should.equal(false);
        publicLeagues.list.should.not.matchAny(id);
      }));
  });
  describe('state of open', () => {
    it('can make league open',
      () => handle(new L.Open(authorizedChange))
      .then(({ league }) => {
        league.open.should.equal(true);
      }));
    it('can make league closed again',
      () => handle(new L.Close(authorizedChange))
      .then(({ league }) => {
        league.open.should.equal(false);
      }));
  });

  describe('rules management', () => {
    const rule = new L.AddTextRule(authorizedChange, 'nice rule to achieve');
    it('can add text rule',
      () => handle(rule)
      .then(({ league }) => {
        league.rules.should.matchAny({ id: rule.ruleId, rule: 'nice rule to achieve' });
      }),
    );
    it('can discard rule',
      () => handle(new L.DiscardRule(authorizedChange, rule.ruleId))
     .then(({ league }) => {
       league.rules.should.deepEqual([]);
     }),
    );
    it('can change type',
      () => handle(new L.ChangeType(authorizedChange, '2vs2'))
      .then(({ league }) => {
        league.type.should.equal('2vs2');
      }),
    );
  });

  describe('player management', () => {
    const player = { id: 'gh:2', team: 'Barcelona', rate: 5 };
    it('can add player',
      () => handle(new L.AddPlayer(authorizedChange, player))
      .then(({ league }) => {
        league.players.should.matchAny(player);
      }));
    it('can change player team');
  });

  describe('player join', () => {
    const player = { id: 'gh:3', team: 'Real Madrid', rate: 5 };
    const localRequester = { id, requester: player.id };
    it('should prevent add player on closed league',
      () => handle(new L.RequestJoin(localRequester, player))
      .should.be.rejectedWith(AccessDeniedError),
    );

    it('open league', () => handle(new L.Open(authorizedChange)));

    it('can add player',
      () => handle(new L.RequestJoin(localRequester, player))
      .then(({ league, table }) => {
        league.players.should.matchAny(player);
        table.list.should.matchAny(Object.assign({}, player, {
          matches: 0,
          wins: 0,
          loses: 0,
          points: 0,
        }));
      }));

    it('should prevent add the same player',
      () => handle(new L.RequestJoin(localRequester, player))
      .should.be.rejectedWith(L.exceptions.NotModified));

    const newTeam = { team: 'Villareal', rate: 4.5 };
    it('can change player team',
      () => handle(new L.ChangeTeam(localRequester, { player: player.id, team: newTeam }))
      .then(({ league, table }) => {
        league.players.should.matchAny({ id: player.id, team: newTeam.team, rate: newTeam.rate });
        table.list.should.matchAny({ id: player.id, team: newTeam.team, rate: newTeam.rate });
      }));
  });
  describe('prevent actions before run', () => {
    const localRequester = { id, requester: 'gh:2' };
    const home = { player: 'gh:1', score: 3 };
    const away = { player: 'gh:2', score: 2 };
    it('prevent adding match if league is not ongoing',
      () => handle(new L.AddMatch(localRequester, { home, away }))
      .should.be.rejectedWith(L.exceptions.BadRequest));
  });

  describe('run the tournament', () => {
    it('run the tournament',
      () => handle(new L.StartLeague(authorizedChange))
      .then(({ league }) => {
        league.state.should.equal('ongoing');
      }));
    it('fail when try to run again');
  });

  describe('matches', () => {
    it('can add match');
    it('can update the match');
  });
  describe('finish the tournament', () => {
    it('terminate the tournament');
  });
  after(reset);
});
