exports.up = function (knex) {
  return knex.schema.alterTable('patients', (table) => {
    table.foreign('genderId').references('id').inTable('genders');
  });
};

exports.down = function (knex) {};
