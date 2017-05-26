const bool = v => Boolean(v);
const int = i => parseInt(i, 10);

function _(name, def, t) {
  const transform = t || (a => a);
  function orDefault() {
    if (typeof def !== 'undefined') {
      return transform(def);
    }
    throw new Error(`ENV variable ${name} value couldn't be determined. Default value not set!`);
  }
  if ({}.hasOwnProperty.call(process.env, name)) {
    const env = transform(process.env[name]);
    return (env) || orDefault();
  }
  return orDefault();
}

module.exports = {
  env: _('ENV', 'dev'),
  github: {
    clientID: _('GITHUB_CLIENT_ID', 'github-client-id'),
    clientSecret: _('GITHUB_SECRET', 'github-secret'),
    callbackURL: _('GITHUB_REDIRECT_URI', 'http://127.0.0.1:8080/api/_github/callback'),
  },
  redis: {
    url: _('REDIS_URI', 'redis://127.0.0.1:6379'),
  },
  app: {
    ownerId: 'github:5791952',
  },
  jwt: {
    secret: _('JWT_SECRET', 'bolimnienoga'),
    opt: {
      issuer: 'Mateusz Odelga',
      expiresIn: '7 days',
    },
  },
  http: {
    port: _('HTTP_PORT', 8000, int),
  },
};
