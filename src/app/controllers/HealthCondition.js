const rfr = require('rfr');
const Yup = require('yup');
const dateFns = require('date-fns');
const cpfValidator = require('cpf-cnpj-validator').cpf;
const Logger = rfr('src/lib/logger');
const Errors = rfr('src/lib/errors');
const knex = rfr('src/database/connection');
const { SORT } = rfr('src/lib/helpers');

class HealthCondition {
  async create(req, res) {
    Logger.header('controller - health condition - create');

    const { patientId } = req.query;

    let { description, relative } = req.body;

    description = description.trim().toLowerCase();

    const schema = Yup.object().shape({
      description: Yup.string().required(),
      relative: Yup.string(),
    });

    if (!(await schema.isValid(req.body))) {
      Logger.error('Validation failed');

      return res
        .status(Errors.BAD_REQUEST)
        .json({ error: 'Validation failed' });
    }

    const [patientExists] = await knex('patients')
      .select('patients.*')
      .where({ 'patients.id': patientId });

    if (!patientExists) {
      Logger.error('Patient not found');

      return res.status(Errors.NOT_FOUND).json({ error: 'Patient not found' });
    }

    const [conditionExists] = await knex('health_conditions')
      .select('health_conditions.*')
      .where({
        'health_conditions.patientId': patientId,
        'health_conditions.description': description,
      });

    if (conditionExists) {
      Logger.error('Health condition already in the list');

      return res
        .status(Errors.BAD_REQUEST)
        .json({ error: 'Health conditions already in the list' });
    }

    if (relative) {
      relative = relative.trim().toLowerCase();

      const [relativeIdExists] = await knex('relatives')
        .select('relatives.*')
        .where({
          'relatives.patientId': patientId,
          'relatives.description': relative,
        });

      if (!relativeIdExists) {
        const [relativeId] = await knex('relatives').insert({
          'relatives.patientId': patientId,
          'relatives.description': relative,
        });

        const [relativeConditionExists] = await knex('health_conditions')
          .select('health_conditions.*')
          .where({
            'health_conditions.patientId': patientId,
            'health_conditions.description': description,
            'health_conditions.relativeId': relativeId,
          });

        if (relativeConditionExists) {
          Logger.error('Family history already registered');

          return res
            .status(Errors.BAD_REQUEST)
            .json({ error: 'Family history already registered' });
        }

        const condition = {
          patientId,
          relativeId,
          description,
          created_at: new Date(),
          updated_at: new Date(),
        };

        const [id] = await knex('health_conditions').insert(condition, 'id');

        return res.json({
          id,
          ...condition,
        });
      }
    }

    const condition = {
      patientId,
      description,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const [id] = await knex('health_conditions').insert(condition, 'id');

    return res.json({
      id,
      ...condition,
    });
  }
}

module.exports = new HealthCondition();
