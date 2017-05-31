const { db, notFound, toJson, asJson } = require('./db');
const _ = require('lodash');
const bluebird = require('bluebird');

const packAsField = name => (value) => {
  const o = {};
  o[name] = value;
  return o;
};

const service = {
  findById: id => service.findByRawId(`user:${id}`),
  findByRawId: id => db.getAsync(id).then(notFound(`user has been not found by id ${id}`)).then(asJson),
  store: user => db.setAsync(`user:${user.id}`, toJson(user)),
  getLevel: id => db.getAsync(`user-level:${id}`).then(level => (level || 'user')),
  setLevel: (id, level) => db.setAsync(`user-level:${id}`, level),
  profile: id => bluebird
    .join(
      service.findById(id),
      service.getLevel(id).then(packAsField('level')))
      .spread(_.merge),
  list: () => db.keysAsync('user:*')
    .then(users => users.map(rawId => rawId.substring(5)).map(id => service.profile(id)))
    .all(a => a)
    .then(asJson)
    .then(users => _.keyBy(users, (u => u.id))),
};

module.exports = service;
