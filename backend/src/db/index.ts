import knex from "knex";
import { Model } from "objection";
import knexConfig from "./knexfile";

const connection = knex(knexConfig as any);
Model.knex(connection);
export default connection;
