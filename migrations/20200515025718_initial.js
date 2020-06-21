
exports.up = function(knex) {
    return knex.schema.hasTable('transaction')
    .then((exists) => {
        if(!exists) {
            return knex.schema.createTable('transaction', function(table) {
                table.increments().primary();
                table.string('onepipe_request_ref');
                table.string('onepipe_transaction_ref').notNullable();
                table.text('provider_request', 'longtext');
                table.text('provider_response', 'longtext');
                table.string('provider_status');
                table.string('provider_transaction_ref');
            })
        }
    })
};

exports.down = function(knex) {
    return knex.schema.dropTableIfExists('transaction')
};
