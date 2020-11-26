exports.up = function (knex) {
  return knex.schema.alterTable('patients', (table) => {
    table.foreign('genderId').references('id').inTable('genders');
    table.foreign('userId').references('id').inTable('users');
  });
};

exports.down = function (knex) {};
