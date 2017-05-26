module.exports = {
  user: [
    { id: 1, action: 'create', payload: { name: 'Mat' } },
    { id: 2, action: 'create', payload: { name: 'Pat' } },
  ],
  match: [
    { id: 1, action: 'start', payload: { home: { user: 1 }, away: { user: 2 } } },
  ],
  league: [
    { id: 1, action: 'create', payload: {} },
  ],
};
