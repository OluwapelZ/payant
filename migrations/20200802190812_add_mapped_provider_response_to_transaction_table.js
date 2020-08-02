
exports.up = function(knex) {
    return knex.schema.hasTable('transaction')
        .then((exists) => {
            if (exists) {
                return knex.schema.table('transaction', (table) => {
                    table.text('mapped_response').notNullable();
                })
            }
        });
};

exports.down = function(knex) {
    return knex.schema.table('transaction', (table) => {
        table.dropColumn('mapped_response');
    });
};
