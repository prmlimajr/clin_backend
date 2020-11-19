const rfr = require('rfr');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');

const Errors = rfr('src/lib/errors');
const Logger = rfr('src/lib/logger');
const authConfig = rfr('src/config/auth');

module.exports = async (req, res, next) => {
  Logger.header('middleware - auth');

  const authHeader = req.headers.authorization;

  if (!authHeader) {
    Logger.error('Missing header authorization');

    return res
      .status(Errors.UNAUTHORIZED)
      .json({ error: 'Missing header authorization' });
  }

  const [, token] = authHeader.split(' ');

  try {
    const decoded = await promisify(jwt.verify)(token, authConfig.secret);

    req.userId = decoded.id;
    req.isAdmin = decoded.admin;
    req.userName = decoded.name;
    req.userEmail = decoded.email;

    return next();
  } catch (err) {
    Logger.error('Invalid token');

    return res.status(Errors.UNAUTHORIZED).json({ error: 'Invalid token' });
  }
};
