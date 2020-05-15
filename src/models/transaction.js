const Bookshelf = require('../db');
const { snakeCaseObjectMap } = require('../utils/util');

class User extends Bookshelf.Model {
    get tableName() {
        return 'transaction';
    }

    async create(transactionDetails) {
        const data = snakeCaseObjectMap(transactionDetails, (value) => {
            return value;
        })

        return this.save(data, { method: 'insert' })
            .then(response => response.toJSON())
            .catch((err) => {
                throw err;
            });
    }

    async fetchTransactionByRef(transactionRef) {
        return this.where({ onepipe_transaction_ref: transactionRef }).
            then(response => response.toJSON())
            .catch((err) => {
                throw err;
            });
    }
}

module.exports = User;
