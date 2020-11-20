const rfr = require('rfr');
const Yup = require('yup');
const dateFns = require('date-fns');
const cpfValidator = require('cpf-cnpj-validator').cpf;
const Logger = rfr('src/lib/logger');
const Errors = rfr('src/lib/errors');
const knex = rfr('src/database/connection');
const { SORT } = rfr('src/lib/helpers');

class PatientController {
  async create(req, res) {
    Logger.header('controller - patient - create');

    const { name, birthday, genderId, cpf } = req.body;

    const schema = Yup.object().shape({
      name: Yup.string().required(),
      birthday: Yup.date().required(),
      genderId: Yup.number().positive().required(),
      cpf: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      Logger.error('Validation failed');

      return res
        .status(Errors.PRECONDITION_FAILED)
        .json({ error: 'Validation failed' });
    }

    const [patientExists] = await knex('patients')
      .select('patients.*')
      .where({ 'patients.cpf': cpf });

    if (patientExists) {
      Logger.error('Patient already exists');

      return res
        .status(Errors.PRECONDITION_FAILED)
        .json({ error: 'Patient already exists' });
    }

    const validatedCpf = cpfValidator.isValid(cpf);

    if (!validatedCpf) {
      Logger.error('Invalid CPF');

      return res
        .status(Errors.PRECONDITION_FAILED)
        .json({ error: 'Invalid CPF' });
    }

    const patient = {
      name: name.trim(),
      birthday,
      genderId,
      cpf,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const [id] = await knex('patients').insert(patient, 'id');

    if (!id) {
      Logger.error('Connection failed');

      return res
        .status(Errors.INTERNAL_SERVER_ERROR)
        .json({ error: 'Connection failed' });
    }

    return res.json({
      id,
      ...patient,
    });
  }

  async list(req, res) {
    Logger.header('controller - patient - list');

    const patientsList = await knex('patients')
      .select('patients.*', 'genders.description as gender')
      .join('genders', 'patients.genderId', 'genders.id');

    const patients = patientsList.map((row) => {
      return {
        id: row.id,
        name: row.name.toUpperCase(),
        birthday: row.birthday,
        age: dateFns.differenceInYears(new Date(), row.birthday),
        gender: row.gender,
        cpf: cpfValidator.format(row.cpf),
        created_at: row.created_at,
        updated_at: row.updated_at,
      };
    });

    patients.sort(SORT);

    return res.json(patients);
  }

  async lazyList(req, res) {
    Logger.header('controller - patients - lazyList');

    const { search, page, perPage } = req.query;

    const query = knex('patients')
      .select('patients.*', 'genders.description as gender')
      .join('genders', 'patients.genderId', 'genders.id')
      .offset((page - 1) * perPage)
      .limit(perPage);

    if (search) {
      query.andWhere((builder) => {
        builder.where('patients.name', 'like', `%${search}%`);
        builder.orWhere('patients.birthday', 'like', `%${search}%`);
        builder.orWhere('patients.cpf', 'like', `%${search}%`);
        builder.orWhere('genders.description', 'like', `%${search}%`);
      });
    }

    const rows = await query;

    const patients = rows.map((row) => {
      return {
        id: row.id,
        name: row.name.toUpperCase(),
        birthday: row.birthday,
        age: dateFns.differenceInYears(new Date(), row.birthday),
        gender: row.gender,
        cpf: cpfValidator.format(row.cpf),
        created_at: row.created_at,
        updated_at: row.updated_at,
      };
    });

    patients.sort(SORT);

    return res.json(patients);
  }

  async listOne(req, res) {
    Logger.header('controller - patients - listOne');
    const { id } = req.params;
    Logger.log(`[${id}]`);

    const [patientExists] = await knex('patients')
      .select('patients.*', 'genders.description as gender')
      .join('genders', 'genders.id', 'patients.genderId')
      .where({ 'patients.id': id });

    if (!patientExists) {
      Logger.error('Patient does not exist');

      return res
        .status(Errors.NOT_FOUND)
        .json({ error: 'Patient does not exist' });
    }

    const patient = {
      id: patientExists.id,
      name: patientExists.name.toUpperCase(),
      birthday: patientExists.birthday,
      age: dateFns.differenceInYears(new Date(), patientExists.birthday),
      gender: patientExists.gender,
      cpf: cpfValidator.format(patientExists.cpf),
      created_at: patientExists.created_at,
      updated_at: patientExists.updated_at,
    };

    return res.json(patient);
  }

  async update(req, res) {
    Logger.header('controller - patients - update');
    const { id } = req.params;
    Logger.log(`[${id}]`);

    const { name, birthday, genderId, cpf } = req.body;

    const schema = Yup.object().shape({
      name: Yup.string(),
      birthday: Yup.date(),
      genderId: Yup.number().positive(),
      cpf: Yup.string(),
    });

    if (!(await schema.isValid(req.body))) {
      Logger.error('Validation failed');

      return res
        .status(Errors.PRECONDITION_FAILED)
        .json({ error: 'Validation failed' });
    }

    const [patientExists] = await knex('patients')
      .select('patients.*', 'genders.description as gender')
      .join('genders', 'genders.id', 'patients.genderId')
      .where({ 'patients.id': id });

    if (!patientExists) {
      Logger.error('Patient does not exist');

      return res
        .status(Errors.NOT_FOUND)
        .json({ error: 'Patient does not exist' });
    }

    if (!req.isAdmin) {
      Logger.error('Only admins can update patient info');

      return res
        .status(Errors.FORBIDDEN)
        .json({ error: 'Only admins can update patient info' });
    }

    if (cpf) {
      const validatedCpf = cpfValidator.isValid(cpf);

      if (!validatedCpf) {
        Logger.error('Invalid CPF');

        return res
          .status(Errors.PRECONDITION_FAILED)
          .json({ error: 'Invalid CPF' });
      }
    }

    const update = {
      name: name ? name.trim() : patientExists.name,
      birthday: birthday || patientExists.birthday,
      genderId: genderId || patientExists.genderId,
      cpf: cpf || patientExists.cpf,
      created_at: patientExists.created_at,
      updated_at: new Date(),
    };

    await knex('patients').update(update).where({ 'patients.id': id });

    return res.json({
      id,
      ...update,
    });
  }

  async delete(req, res) {
    Logger.header('controller - patients - delete');
    const { id } = req.params;
    Logger.log(`[${id}]`);

    if (!req.isAdmin) {
      Logger.error('Only admins can delete patient');

      return res
        .status(Errors.FORBIDDEN)
        .json({ error: 'Only admins can delete patient' });
    }

    const [patientExists] = await knex('patients')
      .select('patients.*')
      .where({ 'patients.id': id });

    if (!patientExists) {
      Logger.error('Patient not found');

      return res.status(Errors.NOT_FOUND).json({ error: 'Patient not found' });
    }

    await knex('patients').del().where({ 'patients.id': id });

    return res.json({ deleted: id });
  }
}

module.exports = new PatientController();
