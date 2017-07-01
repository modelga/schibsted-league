const Type = require('./Type');

module.exports = class Helper {
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
};
