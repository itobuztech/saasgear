
exports.up = function(knex) {
  return knex.schema.createTable('companies', (t) => {
    t.increments('id');
    t.string('name').notNullable();
    t.string('email').notNullable();
    t.string('url');
    t.dateTime('created_at')
      .notNullable()
      .defaultTo(knex.raw('CURRENT_TIMESTAMP'));
    t.dateTime('updated_at')
      .notNullable()
      .defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
    t.dateTime('deleted_at');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('companies');
};
