const Yup = require('yup');
const rfr = require('rfr');
const bcrypt = require('bcryptjs');
const Logger = rfr('src/lib/logger');
const Errors = rfr('src/lib/errors');
const knex = rfr('src/database/connection');

class UserController {
  async create(req, res) {
    Logger.log('controller - user - create');

    const { name, email, password } = req.body;

    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string().email().required(),
      password: Yup.string().min(6).required(),
    });

    if (!(await schema.isValid(req.body))) {
      Logger.error('Validation failed');

      return res
        .status(Errors.BAD_REQUEST)
        .json({ error: 'Validation failed' });
    }

    const [userAlreadyExists] = await knex
      .select('users.*')
      .from('users')
      .where({ 'users.email': email });

    if (userAlreadyExists) {
      Logger.error('User already exists');

      return res
        .status(Errors.PRECONDITION_FAILED)
        .json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 8);

    const user = {
      name,
      email,
      password: hashedPassword,
      admin: false,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const [id] = await knex('users').insert(user, 'id');

    if (!id) {
      Logger.error('Connection failed');

      return res
        .status(Error.INTERNAL_SERVER_ERROR)
        .json({ error: 'Connection failed' });
    }

    return res.json({
      id,
      ...user,
    });
  }
}

module.exports = new UserController();
