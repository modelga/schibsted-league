/* eslint-env node, mocha */
const base = '../../../main/node';
require('../config');
require('should');
const Events = require('events');

const { handler, Command, Type } = require(`${base}/es/CommandHandler`);

class Projection extends Events {
  constructor(name, id) {
    super();
    this.name = name;
    this.id = id;
    this.meta = {};
    this.meta[`es:${name}-${id}`] = 0;
    setTimeout(() => this.emit('state', this.state(), this), 10);
  }
  handle() {}
  state() { return { id: 'value' }; }
}
const stubProjection = (name, id) => new Projection(name, id);
const manager = { projection: (name, id) => Promise.resolve(stubProjection(name, id)) };

class CommandA extends Command {
  applicable(projections) {
    return true;
  }
  events() {
    return { commandA: [{}] };
  }
  custom(name, type) {
    const { stringType, stream, projection } = Command.customType(type);
    if (stream && name === 'action') return `${this.aggregateId}.1`;
    if (projection && name === 'commandA') return `${this.aggregateId}.1`;
    throw new Error(`Not Found definition custom defitinion for ${stringType} named '${name}'`);
  }
}

class CommandB extends Command {}

describe('A CommandHandler', () => {
  it('do', () => {
    handler.push(CommandA,
      ['commandA', { cmd: Type.Single }, { action: Type.Custom }],
      [{ commandA: Type.Custom }, 'commandB']);

    handler.push(CommandB, id => [`commandB:${id}`]);
    const f1 = handler.process(new CommandA(1), manager).then(console.log);
  });
});
