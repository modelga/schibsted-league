module.exports = {
  match: [
    { id: 1, action: 'start', payload: { home: { user: 1 }, away: { user: 2 } } },
  ],
  league: [
    { id: 1, action: 'create', payload: {} },
  ],
};
