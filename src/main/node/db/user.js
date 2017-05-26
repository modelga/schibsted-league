const { db, notFound, toJson, asJson } = require('./db');

const service = {
  findById: id => service.findByRawId(`user:${id}`),
  findByRawId: id => db.getAsync(id).then(notFound(`user has been not found by id ${id}`)).then(asJson),
  storeById: (id, user) => db.setAsync(`user:${id}`, toJson(user)),
  getLevel: id => db.getAsync(`user-level:${id}`).then(level => (level || 'user')),
  setLevel: (id, level) => db.setAsync(`user-level:${id}`, level),
  list: () => db.keysAsync('user:*').then(users => users.map(u => service.findByRawId(u))).all(a => a).then(asJson),
};

module.exports = service;
