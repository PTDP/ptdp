import knex from 'knex';
import { Model } from 'objection';
const knexConfig = require('./knexfile.js');

const connection = knex(knexConfig as any);
Model.knex(connection);
export default connection;