exports.up = function (knex) {
  return knex.schema.table('users', (table) => {
    table.dateTime('last_logged_in');
    table.integer('company_id').unsigned();
    table.foreign('company_id').references('id').inTable('companies');
  });
};

exports.down = function (knex) {
  return knex.schema.table('users', (table) => {
    table.dropColumn('last_logged_in');
  });
};
