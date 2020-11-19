const rfr = require('rfr');
const knex = rfr('src/database/connection');
const Logger = rfr('src/lib/logger');
const Errors = rfr('src/lib/errors');

class AdminController {
  async update(req, res) {
    Logger.header('controller - admin - update');

    const { id } = req.params;

    const [currentUser] = await knex('users')
      .select('users.*')
      .where({ 'users.id': req.userId });

    if (!currentUser.admin) {
      Logger.error('Current user is not an admin');

      return res
        .status(Errors.FORBIDDEN)
        .json({ error: 'Current user is not an admin' });
    }

    const [userExists] = await knex('users')
      .select('users.*')
      .where({ 'users.id': id });

    if (!userExists) {
      Logger.error('User does not exist');

      return res
        .status(Errors.NOT_FOUND)
        .json({ error: 'User does not exist' });
    }

    // if (userExists.admin) {
    //   Logger.error('User is admin already');

    //   return res
    //     .status(Errors.PRECONDITION_FAILED)
    //     .json({ error: 'User is admin already' });
    // }

    const user = {
      admin: !userExists.admin,

      updated_at: new Date(),
    };

    await knex('users').update(user).where({ 'users.id': id });

    return res.json({
      id,
      ...user,
    });
  }
}

module.exports = new AdminController();
