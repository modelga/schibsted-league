const _ = require('lodash');

const { EventStream } = require('../EventStream');
const Command = require('./Command');
const Helper = require('./Helper');
const deferred = require('deferred');

const Ex = require('./exceptions');

function* hierarchy(clazz) {
  let parent = Object.getPrototypeOf(clazz);
  while (parent !== Function.prototype) {
    yield parent;
    parent = Object.getPrototypeOf(parent);
  }
}

class CommandHandler {
  constructor() {
    this.latestId = '';
    this.patterns = [];
  }
  async eventStream(command, lookup, meta) {
    const seed = await this.seed(lookup, command);
    const extracted = CommandHandler.extract(command, seed.es);
    const ids = extracted.map(es => EventStream.id(es.name, es.aggregateId));
    const idList = ids.join(',');
    return new EventStream(meta, idList);
  }
  async process(command, manager) {
    if (!command || !(command instanceof Command)) {
      throw new Ex.InvalidCommandError('Invalid command');
    }
    if (!manager || typeof manager.projection !== 'function') {
      throw new Ex.ManagerNotDefinedError(`${manager} is not a valid manager`);
    }
    const lookup = Object.getPrototypeOf(command);
    const eventStream = async meta => this.eventStream(command, lookup, meta);

    return CommandHandler.projections(this.seed(lookup, command), manager, command)
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
        .then(async (meta) => {
          const es = await eventStream(meta);
          const d = deferred();
          es.stream.on('event',
            (e) => {
              if (e.id > this.latestId) { // prevent sending unique event only once
                this.latestId = e.id;
                _.forEach(projections, (p => p.handle(e)));
              }
            });
          es.stream.once('up-to-date', async () => {
            let applicable;
            try {
              applicable = await command.applicable(_.mapValues(projections, a => a.state()));
              if (applicable !== false) {
                d.resolve({ projections, store: (events, family) => es.store(events, family), es });
              } else {
                es.destroy();
                throw new Ex.CommandNotApplicableError(`${command.constructor.name}(${command.aggregateId})`);
              }
            } catch (e) {
              es.destroy();
              applicable = false;
              d.reject(e);
            }
          });
          es.start();
          return d.promise;
        })
        .then(async ({ es, store }) => {
          const events = command.events();
          const dd = deferred();
          es.stream.once('up-to-date', () => {
            dd.resolve(_.mapValues(projections, p => p.state()));
            es.destroy();
          });
          if (Array.isArray(events)) {
            await store(events, null);
          } else {
            await Promise.all(_.map(events, (a, key) => store(a, key)))
            .then(_.flatten);
          }
          return dd.promise;
        });
    });
  }

  async seed(lookup, command) {
    const found = _.find(this.patterns, (pattern => pattern.p === lookup));
    if (found) return found;
    throw new Ex.CommandNotDeclaredError(`command '${command.constructor.name}' not declared`);
  }

  static async projections(seed, manager, command) {
    const found = await seed;
    const defs = CommandHandler.extract(command, found.proj);
    const projections = await Promise.all(
      defs.map((p) => {
        if (command.creating() || p.allowCreate) {
          return manager.findOrCreateProjection(p.name, p.aggregateId);
        }
        return manager.projection(p.name, p.aggregateId);
      }));
    const renamedProjections = _.map(projections, (o, i) => {
      const key = (defs[i].rename || o.name);
      return [key, o];
    });
    return _.fromPairs(renamedProjections);
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
    if (typeof c === 'function' && typeof c.declare === 'function' && [...hierarchy(c)].indexOf(Command) !== -1) {
      const declare = c.declare();
      const { es, proj } = declare || {};
      if (!declare) {
        throw new Ex.InvalidCommandError('static declare method returns undefined');
      }
      if (_.isArray(declare)) {
        if (_.isEmpty(declare)) {
          throw new Ex.InvalidCommandError(`empty array passed for command ${c.name} declaration`);
        } else {
          return this.push(c, declare, declare);
        }
      } else if (_.isEmpty(es) || _.isEmpty(proj)) {
        throw new Ex.InvalidCommandError(`es or proj list are empty for command ${c.name} declaration`);
      }
      return this.push(c, es, proj);
    }
    throw new Ex.InvalidCommandError('invalid command');
  }
}

module.exports = CommandHandler;
