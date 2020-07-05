
exports.up = function(knex) {
    return knex.schema.hasTable('transaction')
        .then((exists) => {
            if (exists) {
                return knex.schema.table('transaction', (table) => {
                    table.string('request_mode').notNullable();
                    table.string('order_reference').unique();
                    table.string('otp');
                    table.boolean('is_order_active');
                })
            }
        });
};

exports.down = function(knex) {
    return knex.schema.table('transaction', (table) => {
        table.dropColumn('request_mode');
        table.dropColumn('order_reference');
        table.dropColumn('is_order_active');
        table.dropColumn('otp');
    });
};
