exports.seed = function (knex) {
  return knex('genders')
    .del()
    .then(function () {
      return knex('genders').insert([
        { id: 1, description: 'Masculino' },
        { id: 2, description: 'Feminino' },
      ]);
    });
};
