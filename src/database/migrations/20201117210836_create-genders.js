exports.up = function (knex) {
  return knex.schema.createTable('genders', (table) => {
    table.increments('id').primary();
    table.string('description').notNullable();
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('genders');
};
