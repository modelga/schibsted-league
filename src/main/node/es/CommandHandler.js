const _ = require('lodash');

const { EventStream } = require('./EventStream');
const { Event } = require('./Event');
const deferred = require('deferred');

class InvalidCommandError extends Error { }
class CommandNotApplicableError extends Error { }
class CommandNotDeclaredError extends Error { }
const Type = {
  Single: Symbol('Single'),
  AggreateId: Symbol('AggreateId'),
  Custom: Symbol('Custom'),
  Projection: Symbol('Projection'),
  EventStream: Symbol('EventStream') };

class Helper {
  static projection(value) {
    return Helper.commonResolver(value, Type.Projection);
  }
  static eventStream(value) {
    return Helper.commonResolver(value, Type.EventStream);
  }
  static commonResolver(value, base) {
    const key = typeof value === 'string' ? value : Object.keys(value)[0];
    const type = typeof value === 'string' ? Type.AggreateId : Object.values(value)[0];
    switch (type) {
      case Type.AggreateId: return id => ({ name: key, aggregateId: id });
      case Type.Single: return () => ({ name: key, aggregateId: 'single' });
      case Type.Custom: return (id, custom) => ({ name: key, aggregateId: custom(key, base) });
      default:
        return id => ({ name: key, aggregateId: id });
    }
  }
}

class CommandHandler {
  constructor() {
    this.patterns = [];
  }
  process(command, manager) {
    const lookup = Object.getPrototypeOf(command);
    const seed = () => {
      const found = _.find(this.patterns, (pattern => pattern.p === lookup));
      if (found) return Promise.resolve(found);
      return Promise.reject(new CommandNotDeclaredError());
    };
    const eventStream = meta => seed()
    .then(found => CommandHandler.extract(command, found.es))
    .then(e => e.map(es => EventStream.id(es.name, es.aggregateId)))
    .then(a => a.join(','))
    .then(a => new EventStream(meta, a));

    return CommandHandler.checkApplicability(seed(), manager, command)
    .then((check) => {
      if (check.applicable) {
        return check.projections;
      }
      return Promise.reject(CommandNotApplicableError(command));
    })
    .then((projections) => {
      const ready = _.map(projections, (v, k) => {
        const d = deferred();
        v.once('state', (a, b) => {
          d.resolve(b.meta);
        });
        return d.promise;
      });
      return Promise.all(ready).then(a => _.reduce(a, (a, b) => Object.assign({}, a, b)));
    });
  }
  static checkApplicability(seed, manager, command) {
    return seed.then((found) => {
      const projections = CommandHandler.extract(command, found.proj)
        .map(p => manager.projection(p.name, p.aggregateId));
      return Promise.all(projections)
        .then(p => _.keyBy(p, 'name'))
        .then(p => ({
          applicable: command.applicable(p),
          projections: p,
        }));
    });
  }
  static extract(command, from) {
    return from.map(definition => definition(command.aggregateId, command.custom.bind(command)));
  }
  push(command, es, proj) {
    this.patterns = this.patterns.concat({
      p: command.prototype,
      es: _.map(es, Helper.eventStream),
      proj: _.map(proj, Helper.projection),
    });
  }
}

class Command {
  constructor(aggregateId) {
    this.aggregateId = aggregateId;
  }
  custom(name, type) {
    return undefined;
  }
  events() {
    return [];
  }
  /**
  @return Promise
  */
  applicable() {
    return Promise.resolve(false);
  }
  static customType(type) {
    const stringType = type === Type.EventStream ? 'event-stream' : 'projection';
    const stream = type === Type.EventStream;
    const projection = !stream;
    return { stringType, stream, projection };
  }
}
module.exports = {
  Type,
  Event,
  Command,
  handler: new CommandHandler(),
  InvalidCommandError,
  CommandNotDeclaredError,
  CommandNotApplicableError,
};
