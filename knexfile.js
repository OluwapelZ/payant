const config = require('./src/config/config');

module.exports = {
  client: 'mysql2',
  connection: {
    host: config.mysql.host,
    database: config.mysql.database,
    user: config.mysql.user,
    password: config.mysql.password,
    port: Number(config.mysql.port),
  },
  migrations: {
    tableName: 'migrations',
  },
  seeds: {
    directory: './seeds/',
  },
};
