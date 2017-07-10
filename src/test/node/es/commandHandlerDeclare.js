/* eslint-env node, mocha */
const base = '../../../main/node';
const { InvalidCommandError, Command } = require(`${base}/es/command`);
const { CommandHandler } = require(`${base}/es/command`);

const handler = new CommandHandler();

module.exports = () => describe('CommandHandler@declare', () => {
  it('should reject on invalid type of command', () => {
    try {
      handler.declare(null);
      throw new Error('unexpected pass');
    } catch (e) {
      e.should.be.instanceOf(InvalidCommandError);
      e.message.should.match('invalid command');
    }
  });
  it('should reject on type of command', () => {
    try {
      handler.declare(() => ({ declare() {} }));
      throw new Error('unexpected pass');
    } catch (e) {
      e.should.be.instanceOf(InvalidCommandError);
      e.message.should.match('invalid command');
    }
  });
  it('should reject on incomplete command', () => {
    try {
      class C extends Command {

      }
      handler.declare(C);
      throw new Error('unexpected pass');
    } catch (e) {
      e.should.be.instanceOf(InvalidCommandError);
      e.message.should.match('invalid command');
    }
  });
  it('should reject on invalid static declare in command', () => {
    try {
      class C extends Command {
        static declare() {
        }
      }
      handler.declare(C);
      throw new Error('unexpected pass');
    } catch (e) {
      e.should.be.instanceOf(InvalidCommandError);
      e.message.should.match('static declare method returns undefined');
    }
  });
  it('should reject on empty es and/or proj definition', () => {
    try {
      class C extends Command {
        static declare() {
          return { es: [], proj: [] };
        }
      }
      handler.declare(C);
      throw new Error('unexpected pass');
    } catch (e) {
      e.should.be.instanceOf(InvalidCommandError);
      e.message.should.match('es or proj list are empty for command C declaration');
    }
  });
  it('should reject on empty array passed as proj definition', () => {
    try {
      class C extends Command {
        static declare() {
          return [];
        }
      }
      handler.declare(C);
      throw new Error('unexpected pass');
    } catch (e) {
      e.should.be.instanceOf(InvalidCommandError);
      e.message.should.match('empty array passed for command C declaration');
    }
  });
  it('should pass on complete command', () => {
    class C extends Command {
      static declare() {
        return { es: ['es'], proj: ['proj'] };
      }
    }
    handler.declare(C).p.should.equal(C.prototype);
  });
  it('should pass on complete command', () => {
    class C extends Command {
      static declare() {
        return ['esAndProjDefinition'];
      }
    }
    handler.declare(C).p.should.equal(C.prototype);
  });
});
