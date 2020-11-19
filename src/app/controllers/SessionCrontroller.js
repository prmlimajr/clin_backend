const Yup = require('yup');
const rfr = require('rfr');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const knex = rfr('src/database/connection');
const Logger = rfr('src/lib/logger');
const Errors = rfr('src/lib/errors');
const authConfig = rfr('src/config/auth');

class SessionController {
  async create(req, res) {
    Logger.header('controller - session - create');

    const { email, password } = req.body;

    const schema = Yup.object().shape({
      email: Yup.string().email().required(),
      password: Yup.string().min(6).required(),
    });

    if (!(await schema.isValid(req.body))) {
      Logger.error('Validation failed');

      res
        .status(Errors.PRECONDITION_FAILED)
        .json({ error: 'Validation failed' });
    }

    const [userExists] = await knex('users')
      .select('users.*')
      .where({ 'users.email': email });

    if (!userExists) {
      Logger.error('User not found');

      return res.status(Errors.UNAUTHORIZED).json({ error: 'User not found' });
    }

    const checkPassword = (password) => {
      return bcrypt.compare(password, userExists.password);
    };

    if (!(await checkPassword(password))) {
      Logger.error('Password does not match');

      return res
        .status(Errors.UNAUTHORIZED)
        .json({ error: 'Password does not match' });
    }

    const { id, name, admin } = userExists;

    return res.json({
      user: {
        id,
        name,
        email,
        admin,
      },
      token: jwt.sign({ id, name, email, admin }, authConfig.secret, {
        expiresIn: authConfig.expiresIn,
      }),
    });
  }
}

module.exports = new SessionController();
