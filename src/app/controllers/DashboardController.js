const rfr = require('rfr');
const dateFns = require('date-fns');
const cpfValidator = require('cpf-cnpj-validator').cpf;
const Logger = rfr('src/lib/logger');
const knex = rfr('src/database/connection');
const { SORT } = rfr('src/lib/helpers');

class DashboardController {
  async lazyList(req, res) {
    Logger.header('controller - dashboard controller - lazyList');

    const { search, page, perPage } = req.query;
    console.log(req.query);

    const query = knex('patients')
      .select(
        'patients.*',
        'genders.description as gender',
        'users.name as doctor'
      )
      .join('genders', 'patients.genderId', 'genders.id')
      .join('users', 'users.id', 'patients.userId')
      .offset((page - 1) * perPage)
      .limit(perPage);

    if (search) {
      query.andWhere((builder) => {
        builder.where('patients.name', 'like', `%${search}%`);
        builder.orWhere('patients.birthday', 'like', `%${search}%`);
        builder.orWhere('patients.cpf', 'like', `%${search}%`);
        builder.orWhere('genders.description', 'like', `%${search}%`);
        builder.orWhere('users.name', 'like', `%${search}%`);
      });
    }

    const rows = await query;

    const patients = rows.map((row) => {
      return {
        id: row.id,
        name: row.name.toUpperCase(),
        birthday: dateFns.format(row.birthday, 'dd/MM/yyyy'),
        age: dateFns.differenceInYears(new Date(), row.birthday),
        gender: row.gender,
        doctor: row.doctor,
        cpf: cpfValidator.format(row.cpf),
        created_at: row.created_at,
        updated_at: row.updated_at,
      };
    });

    patients.sort(SORT);

    return res.json(patients);
  }
}

module.exports = new DashboardController();
