const functions = require("firebase-functions");
const CONNECTION_STRING =
  functions.config().db && functions.config().db.connection;
require("ts-node/register");

console.log("functions.config()", functions.config());

export default {
  client: "pg",
  connection: CONNECTION_STRING,
  migrations: {
    directory: "./migrations",
  },
  seeds: {
    directory: "./seeds",
  },
};
