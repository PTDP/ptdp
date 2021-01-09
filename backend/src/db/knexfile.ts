const functions = require('firebase-functions');
const CONNECTION_STRING = functions.config().db && functions.config().db.connection;
require('ts-node/register');

module.exports = {
      client: 'pg',
      connection: CONNECTION_STRING,
      migrations: {
        directory: './migrations',
      },
      seeds: {
        directory: './seeds'
      }
  }