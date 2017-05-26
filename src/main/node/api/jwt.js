const jwt = require('jsonwebtoken');

const config = require('../config').jwt;
const { user, level } = require('../db');

const tpl = token => `
  <html>
    <head>
      <title>JWT Token</title>
      <script>
        window.addEventListener('message', (event) => {
          if (event.data.jwt) {
            console.log(event.data.jwt);
            window.localStorage('jwt', event.data.jwt);
          }
          event.source.postMessage({jwt: '${token}'},'*');
          window.close();
        });
      </script>
    </head>
  </html>
`;
const auth = (req, res) => {
  if (req.user) {
    const token = jwt.sign(req.user, config.secret, config.opt);
    res.send(tpl(token));
  }
};

const protect = (req, res, next) => {
  const token = req.headers['auth-token'];
  if (token) {
    jwt.verify(token, config.secret, config.opt, (err, decoded) => {
      if (err) {
        res.send(401, `Unauthorized: ${err.message}`);
        return;
      }
      req.user = decoded;
      next();
    });
  } else {
    res.send(401);
  }
};

const protectLevel = requestedLevel => (req, res, next) => {
  protect(req, res, () => {
    user.getLevel(req.user.id)
    .then((userLevel) => {
      if (level.isAtLeast(userLevel, requestedLevel)) {
        next();
      } else {
        res.status(401).send(`Unauthorized: insufficient permissions ${userLevel}, needs ${requestedLevel}`);
      }
    })
    .catch((e) => {
      console.error(e);
      res.status(500).send('Internal Server Error');
    });
  });
};
module.exports = { auth, protect, protectLevel };