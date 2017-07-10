/* eslint-env node, mocha */
const base = '../../../main/node';
require('../config');
require('should');

const { CommandHandler } = require(`${base}/es/command`);

const handler = new CommandHandler();

const { Command, Type,
   CommandNotApplicableError, CommandNotDeclaredError,
    InvalidCommandError, ManagerNotDefinedError } = require(`${base}/es/command`);
const { Event } = require(`${base}/es/Event`);
const { db } = require(`${base}/db/db`);

class Make extends Command {
  applicable(projections) {
    return true;
  }
  events() {
    return {
      commandA: [new Event('state', { attach: this.aggregateId }), new Event('state', { attach: 3 })],
      commandB: [new Event('state', { attach: this.aggregateId }), new Event('state', { attach: 5 })],
    };
  }
  custom(name, type) {
    const { stringType, stream, projection } = Command.customType(type);
    if (stream && name === 'action') return `${this.aggregateId}.1`;
    if (projection && name === 'commandA') return `${this.aggregateId}.1`;
    throw new Error(`Not Found definition custom defitinion for ${stringType} named '${name}'`);
  }

  static declare() {
    return {
      es: ['commandA', 'commandB'],
      proj: ['commandA', 'commandB'],
    };
  }
}

class Update extends Command {
  applicable({ commandA, commandB }) {
    commandA.should.match({ attach: 3 });
    commandB.should.match({ attach: 5 });
    return true;
  }
  events() {
    return {
      commandA: [new Event('state', { attach: 4 })],
      commandB: [new Event('state', { attach: 6 })],
    };
  }
  custom(name, type) {
    const { stringType, stream, projection } = Command.customType(type);
    if (stream && name === 'action') return `${this.aggregateId}.1`;
    if (projection && name === 'commandA') return `${this.aggregateId}.1`;
    throw new Error(`Not Found definition custom defitinion for ${stringType} named '${name}'`);
  }

  static declare() {
    return {
      es: ['commandA', 'commandB'],
      proj: ['commandA', 'commandB'],
    };
  }
}
class CommandB extends Command {
  applicable(projections) {
    return null;
  }

  events() {
    return [new Event('state', { attach: this.aggregateId })];
  }

  static declare() {
    return {
      es: ['commandA', 'commandB'],
      proj: ['commandA', 'commandB'],
    };
  }
}
class CustomRejectError extends Error {}
class CustomRejectedCommand extends Command {
  applicable(projections) {
    throw new CustomRejectError('reject');
  }

  static declare() {
    return {
      es: ['a'],
      proj: ['a'],
    };
  }
}

class RejectedCommand extends Command {
  applicable(projections) {
    return false;
  }

  static declare() {
    return {
      es: ['a'],
      proj: ['a'],
    };
  }
}
class InvalidCustomProjectionCommand extends Command {
  static declare() {
    return {
      es: ['a'],
      proj: ['a', { b: Type.Custom }],
    };
  }
}
module.exports = (manager) => {
  const process = cmd => handler.process(cmd, manager);
  const useManager = mgr => handler.process(new Make(1), mgr);
  describe('should fail when trying to use no command', () => {
    it('using nulls', () => process(null).should.be.rejectedWith(InvalidCommandError));
    it('using {}', () => process({}).should.be.rejectedWith(InvalidCommandError));
    it('using { aggregateId}', () => process({ aggregateId: 1 }).should.be.rejectedWith(InvalidCommandError));
    it('using ()=>{}', () => process(() => {}).should.be.rejectedWith(InvalidCommandError));
  });

  describe('check manager application', () => {
    it('using null', () => useManager(null).should.be.rejectedWith(ManagerNotDefinedError));
    it('using {}', () => useManager({}).should.be.rejectedWith(ManagerNotDefinedError));
    it('using ()=>{}', () => useManager(() => {}).should.be.rejectedWith(ManagerNotDefinedError));
  });

  it('should fail when trying to use not declared command', () => {
    class NotDeclared extends Command {}
    return handler.process(new NotDeclared(1), manager)
      .should.be.rejectedWith(CommandNotDeclaredError);
  });
  it('should handle application rejection', () =>
      process(new RejectedCommand(1))
      .should.be.rejectedWith(CommandNotApplicableError));
  it('should handle custom defined application rejection', () =>
      process(new CustomRejectedCommand(1))
      .should.be.rejectedWith(CustomRejectError),
    );
  it('should handle command', () => process(new Make(1)));
  it('should handle command and process events', () =>
    process(new Make(1))
      .then((p) => {
        p.commandA.should.deepEqual({ attach: 3 });
        p.commandB.should.deepEqual({ attach: 5 });
      }),
    );

  it('should persists projection and handle another command and process events', () =>
    process(new Update(1))
      .then((p) => {
        p.commandA.should.deepEqual({ attach: 4 });
        p.commandB.should.deepEqual({ attach: 6 });
      }),
    );
  it('should fail when trying to use not declared custom projection',
    () => process(new InvalidCustomProjectionCommand(1))
    .should.be.rejectedWith(CommandNotApplicableError, { message: /Custom definition expected/ }),
    );

  before(() => {
    handler.declare(Make);
    handler.declare(Update);
    handler.declare(CommandB);
    handler.declare(RejectedCommand);
    handler.declare(CustomRejectedCommand);
    handler.declare(InvalidCustomProjectionCommand);
  });

  before(() => Promise.all([
    db.delAsync(['es:a-1', 'proj:a-1']),
    db.delAsync(['es:commandA-1', 'proj:commandA-1']),
    db.delAsync(['es:commandB-1', 'proj:commandB-1']),
  ]));
};
