const _ = require('lodash');

const { EventStream } = require('../EventStream');
const Command = require('./Command');
const Helper = require('./Helper');
const deferred = require('deferred');

const Ex = require('./exceptions');

class CommandHandler {
  constructor() {
    this.patterns = [];
  }
  process(command, manager) {
    if (!command || !(command instanceof Command)) {
      return Promise.reject(new Ex.InvalidCommandError('Invalid command'));
    }
    if (!manager || typeof manager.projection !== 'function') {
      return Promise.reject(new Ex.ManagerNotDefinedError(`${manager} is not a valid manager`));
    }
    const lookup = Object.getPrototypeOf(command);
    const seed = () => {
      const found = _.find(this.patterns, (pattern => pattern.p === lookup));
      if (found) return Promise.resolve(found);
      return Promise.reject(new Ex.CommandNotDeclaredError(`command '${command.constructor.name}' not declared`));
    };
    const eventStream = meta => seed()
    .then(found => CommandHandler.extract(command, found.es))
    .then(e => e.map(es => EventStream.id(es.name, es.aggregateId)))
    .then(a => a.join(','))
    .then(a => new EventStream(meta, a));

    return CommandHandler.projections(seed(), manager, command)
    .then((projections) => {
      const ready = _.map(projections, (v) => {
        const d = deferred();
        v.once('state', (a, b) => {
          d.resolve(b.meta);
        });
        return d.promise;
      });
      return Promise.all(ready)
        .then(a => _.reduce(a, (acc, c) => Object.assign({}, acc, c)))
        .then(eventStream)
        .then((s) => {
          const d = deferred();
          s.stream.on('event', e => _.forEach(projections, (p => p.handle(e))));
          s.stream.once('up-to-date', () => {
            let applicable;
            try {
              applicable = command.applicable(_.mapValues(projections, a => a.state()));
              if (applicable !== false) {
                d.resolve({ projections, store: (events, family) => s.store(events, family), stream: s });
              } else {
                s.destroy();
                throw new Ex.CommandNotApplicableError(`${command.constructor.name}(${command.aggregateId})`);
              }
            } catch (e) {
              s.destroy();
              applicable = false;
              d.reject(e);
            }
          });
          s.start();
          return d.promise;
        })
        .then((f) => {
          const events = command.events();
          const packResult = result => ({ result, stream: f.stream });
          if (Array.isArray(events)) {
            return f.store(events, null).then(packResult);
          }
          return Promise.all(_.map(events, (a, v) => f.store(a, v))).then(packResult);
        })
        .then((data) => {
          const dd = deferred();
          data.stream.stream.once('up-to-date', (e) => {
            dd.resolve(_.mapValues(projections, p => p.state()));
            data.stream.destroy();
          });
          return dd.promise;
        });
    });
  }
  static projections(seed, manager, command) {
    return seed.then((found) => {
      const projections = CommandHandler.extract(command, found.proj)
        .map((p) => {
          if (command.creatable()) {
            return manager.findOrCreateProjection(p.name, p.aggregateId);
          }
          return manager.projection(p.name, p.aggregateId);
        });
      return Promise.all(projections)
        .then(p => _.keyBy(p, 'name'));
    });
  }
  static extract(command, from) {
    return from.map(definition => definition(command.aggregateId, command.custom.bind(command)));
  }
  push(command, es, proj) {
    let p;
    this.patterns = this.patterns.concat(p = {
      p: command.prototype,
      es: _.map(es, Helper.eventStream),
      proj: _.map(proj, Helper.projection),
    });
    return p;
  }
  clear() {
    this.patterns = [];
  }
  declare(c) {
    if (typeof c === 'function' && typeof c.declare === 'function' && Object.getPrototypeOf(c) === Command) {
      const { es, proj } = c.declare() || {};
      if (!c.declare()) {
        throw new Ex.InvalidCommandError('static declare method returns undefined');
      }
      if (_.isEmpty(es) || _.isEmpty(proj)) {
        throw new Ex.InvalidCommandError(`es or proj list are empty for command ${c.name} declaration`);
      }
      return this.push(c, es, proj);
    }
    throw new Ex.InvalidCommandError('invalid command');
  }
}

module.exports = CommandHandler;
