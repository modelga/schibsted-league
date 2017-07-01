const Ex = require('./exceptions');
const Type = require('./Type');

module.exports = class Command {
  constructor(aggregateId) {
    this.aggregateId = aggregateId;
  }
  custom(name, type) {
    throw new Ex.CommandNotApplicableError(`Custom definition expected on ${type.toString()} ${name}`);
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
};
/**
Necessary to have is static method associated with declare class which returns list of projections and event streams
static declare() {
  return { es: ['es'], proj: ['proj'] };
}
*/
