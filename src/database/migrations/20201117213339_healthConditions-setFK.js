exports.up = function (knex) {
  return knex.schema.alterTable('health_conditions', (table) => {
    table.foreign('patientId').references('id').inTable('patients');
  });
};

exports.down = function (knex) {};
