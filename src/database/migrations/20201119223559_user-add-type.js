exports.up = function (knex) {
  return knex.schema.alterTable('users', (table) => {
    table.integer('type').notNullable().unsigned();
  });
};

exports.down = function (knex) {};
