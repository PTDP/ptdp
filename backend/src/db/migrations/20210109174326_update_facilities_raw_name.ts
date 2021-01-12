import * as Knex from "knex";
import { Tables } from "../constants";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.table(Tables.facilities, (t) => {
    t.string("raw_name");
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.table(Tables.rates, (t) => {
    t.string("raw_name");
  });
}
