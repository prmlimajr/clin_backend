exports.up = function (knex) {
  return knex.schema.alterTable('patients', (table) => {
    table.string('cpf').notNullable();
  });
};

exports.down = function (knex) {};
