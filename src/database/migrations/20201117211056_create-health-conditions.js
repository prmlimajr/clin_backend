exports.up = function (knex) {
  return knex.schema.createTable('health_conditions', (table) => {
    table.increments('id').primary();
    table.integer('patientId').notNullable().unsigned();
    table.boolean('relative').notNullable().defaultTo(false);
    table.string('description').notNullable();
    table.dateTime('created_at').notNullable().defaultTo(knex.fn.now());
    table.dateTime('updated_at').notNullable().defaultTo(knex.fn.now());
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('health_conditions');
};
