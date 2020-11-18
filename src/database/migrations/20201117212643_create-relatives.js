exports.up = function (knex) {
  return knex.schema.createTable('relatives', (table) => {
    table.increments('id').primary();
    table.integer('patientId').notNullable().unsigned();
    table.string('description').notNullable();
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('relatives');
};
