exports.up = function (knex) {
  return knex.schema.alterTable('health_conditions', (table) => {
    table.foreign('patientId').references('id').inTable('patients');
    table.foreign('relativeId').references('id').inTable('relatives');
  });
};

exports.down = function (knex) {};
