const Bookshelf = require('../db');
const { snakeCaseObjectMap, camelCaseObjectMap } = require('../utils/util');
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
            .then(response => {
                const data = response.toJSON();
                const updateData = { id: data.id, is_order_active: false };
                response.save(updateData, { method: 'update', patch: true })
                    .catch((err) => {
                        throw err;
                    });
                return data;
            })
            .catch((err) => {
                if (err.message === 'EmptyResponse') {
                    logger.info(`Transaction is either not active or not found tied to the provided order reference: ${orderReference}`);
                    throw new TransactionNotFoundError(`Transaction is either not active or not found for the provided order reference: ${orderReference}`);
                }

                throw err;
            });
    }

    async fetchTransactionByReference(transactionReference) {
        return this.where({ onepipe_transaction_ref: transactionReference })
            .fetch()
            .then(response => camelCaseObjectMap(response.toJSON(), (value) => value))
            .catch((err) => {
                if (err.message === 'EmptyResponse') {
                    logger.info(`Transaction with the provided reference "${transactionReference}" is not found`);
                    throw new TransactionNotFoundError(`Transaction with the provided reference "${transactionReference}" is not found`);
                }

                throw err;
            });
    }
}

module.exports = Transaction;
