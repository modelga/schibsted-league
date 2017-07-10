const Type = require('./Type');
const _ = require('lodash');

module.exports = class Helper {
  static projection(value) {
    return Helper.commonResolver(value, Type.Projection);
  }
  static eventStream(value) {
    return Helper.commonResolver(value, Type.EventStream);
  }
  static commonResolver(value, base) {
    const name = typeof value === 'string' ? value : Object.keys(value)[0];
    const type = typeof value === 'string' ? Type.AggreateId : Object.values(value)[0];
    const rename = typeof value === 'object' ? value.rename : undefined;
    const allowCreate = typeof value === 'object' ? value.allowCreate : false;
    const addAggregate = aggregateId => ({ name, aggregateId, rename, allowCreate });
    switch (type) {
      case Type.AggreateId: return id => addAggregate(id);
      case Type.Single: return () => addAggregate('single');
      case Type.Custom: return (id, custom) => addAggregate(custom(name, base));
      default: return id => addAggregate(id);
    }
  }
};
