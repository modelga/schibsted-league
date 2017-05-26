const levels = { user: 0, moderator: 1, admin: 2 };

module.exports = {
  isAtLeast: (offered, required) => (levels[offered]) >= (levels[required] || 0),
};
