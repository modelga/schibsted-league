const Ex = require('./exceptions');
const Type = require('./Type');

module.exports = class Command {
  constructor(aggregateId) {
    if (!aggregateId) {
      throw new Error('invalid command aggreagateId:', aggregateId);
    }
    this.aggregateId = aggregateId;
  }
  get id() {
    return this.aggregateId;
  }
  custom(name, type) {
    throw new Ex.CommandNotApplicableError(`Custom definition expected on ${type.toString()} ${name}`);
  }
  events() {
    return [];
  }
  creating() {
    return false;
  }
  /**
  @return Promise
  */
  async applicable() {
    return false;
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
