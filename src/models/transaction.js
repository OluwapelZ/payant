const Bookshelf = require('../db');
const { snakeCaseObjectMap } = require('../utils/util');
const { TransactionNotFoundError } = require('../error');
const logger = require('../utils/logger');

class Transaction extends Bookshelf.Model {
    get tableName() {
        return 'transaction';
    }

    async createTransaction(transactionDetails) {
        const data = snakeCaseObjectMap(transactionDetails, (value) => {
            return value;
        });

        return this.save(data, { method: 'insert' })
            .then(response => response.toJSON())
            .catch((err) => {
                throw err;
            });
    }

    async fetchTransactionByOrderRef(orderReference) {
        return this.where({ order_reference: orderReference, is_order_active: true })
            .fetch()
            .then(response => response.toJSON())
            .catch((err) => {
                if (err.message === 'EmptyResponse') {
                    logger.info(`Transaction not found tied to the provided order reference: ${orderReference}`);
                    throw new TransactionNotFoundError('Transaction not found for the proviced order reference');
                }

                throw err;
            });
    }
}

module.exports = Transaction;
