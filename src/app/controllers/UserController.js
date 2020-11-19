const Yup = require('yup');
const rfr = require('rfr');
const bcrypt = require('bcryptjs');
const Logger = rfr('src/lib/logger');
const Errors = rfr('src/lib/errors');
const knex = rfr('src/database/connection');
const { SORT } = rfr('src/lib/helpers');

class UserController {
  async create(req, res) {
    Logger.header('controller - user - create');

    const { name, email, password, confirmPassword } = req.body;

    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string().email().required(),
      password: Yup.string().min(6).required(),
      confirmPassword: Yup.string().min(6).required(),
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

    if (password !== confirmPassword) {
      Logger.error('Password does not match');
      return res
        .status(Errors.PRECONDITION_FAILED)
        .json({ error: 'Password does not match' });
    }

    const hashedPassword = await bcrypt.hash(password, 8);

    const user = {
      name: name.trim(),
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

  async list(req, res) {
    Logger.header('controller - users - list');

    const userList = await knex('users').select('users.*').from('users');

    if (userList.length === 0) {
      Logger.error('Empty list');
      return res.json({ error: 'Empty list' });
    }

    const users = userList.map((row) => {
      return {
        id: row.id,
        name: row.name,
        email: row.email,
        admin: row.admin,
        created_at: row.created_at,
        updated_at: row.updated_at,
      };
    });

    users.sort(SORT);
    return res.json(users);
  }

  async listOne(req, res) {
    Logger.header('controller - users - listOne');
    Logger.log(`[${req.params.id}]`);

    const { id } = req.params;

    const [userExists] = await knex('users')
      .select('users.*')
      .where({ 'users.id': id });

    if (!userExists) {
      Logger.error('User not found');

      return res.status(Errors.NOT_FOUND).json({ error: 'User not found', id });
    }

    const user = {
      id: userExists.id,
      name: userExists.name,
      email: userExists.email,
      admin: userExists.admin,
      created_at: userExists.created_at,
      update_at: userExists.updated_at,
    };

    return res.json(user);
  }

  async lazyList(req, res) {
    Logger.header('controller - users - lazyList');

    const { search, page, perPage } = req.query;

    const query = knex('users')
      .select('users.*')
      .offset((page - 1) * perPage)
      .limit(perPage);

    if (search) {
      query.andWhere((builder) => {
        builder.where('users.name', 'like', `%${search}%`);
        builder.orWhere('users.email', 'like', `%${search}%`);
      });
    }

    const rows = await query;
    const users = rows.map((row) => {
      return {
        id: row.id,
        name: row.name,
        email: row.email,
        admin: row.admin,
        created_at: row.created_at,
        updated_at: row.updated_at,
      };
    });

    users.sort(SORT);
    return res.json(users);
  }

  async update(req, res) {
    Logger.header('controller - users - update');
    Logger.log(`[${req.params.id}]`);

    const { id } = req.params;
    const { name, email, password, newPassword, confirmPassword } = req.body;

    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
      password: Yup.string().min(6),
      newPassword: Yup.string()
        .min(6)
        .when('password', (password, field) =>
          password ? field.required() : field
        ),
      confirmPassword: Yup.string().when('newPassword', (newPassword, field) =>
        newPassword ? field.required().oneOf([Yup.ref('newPassword')]) : field
      ),
    });

    if (!(await schema.isValid(req.body))) {
      Logger.error('Validation failed');
      return res
        .status(Errors.BAD_REQUEST)
        .json({ error: 'Validation failed' });
    }

    const [currentUser] = await knex('users')
      .select('users.*')
      .where({ 'users.id': req.userId });

    const [userToUpdate] = await knex('users')
      .select('users.*')
      .where({ 'users.id': id });

    if (!currentUser.admin && currentUser.id !== userToUpdate.id) {
      Logger.error('Only admins can update other users');

      return res
        .status(Errors.FORBIDDEN)
        .json({ error: 'Only admins can update other users' });
    }

    const checkPassword = (password) => {
      return bcrypt.compare(password, userToUpdate.password);
    };

    const hashedPassword = newPassword
      ? await bcrypt.hash(newPassword, 8)
      : userToUpdate.password;

    if (password && !(await checkPassword(password))) {
      Logger.error('Password does not match');
      return res
        .status(Errors.BAD_REQUEST)
        .json({ error: 'Password does not match' });
    }

    const user = {
      name: name ? name.trim() : userToUpdate.name,
      email: email || userToUpdate.email,
      password: hashedPassword,
      admin: userToUpdate.admin,
      created_at: userToUpdate.created_at,
      updated_at: new Date(),
    };

    await knex('users').update(user).where({ 'users.id': id });

    return res.json({
      id,
      ...user,
    });
  }

  async delete(req, res) {
    Logger.header('controller - user - delete');
    Logger.log(`[${req.params.id}]`);

    const { id } = req.params;

    const [currentUser] = await knex('users')
      .select('users.*')
      .where({ 'users.id': req.userId });

    if (!currentUser.admin) {
      Logger.error('User is not admin');
      return res.status(Errors.FORBIDDEN).json({ error: 'User is not admin' });
    }

    const [userExists] = await knex('users')
      .select('users.*')
      .where({ 'users.id': id });

    if (!userExists) {
      Logger.error('User not found');

      return res.status(Errors.NOT_FOUND).json({ error: 'User not found' });
    }

    await knex('users').del().where({ 'users.id': id });

    return res.json({ deleted: id });
  }
}

module.exports = new UserController();
