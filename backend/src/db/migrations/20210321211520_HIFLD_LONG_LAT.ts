import * as Knex from "knex";
import { Tables } from "../constants";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.table(Tables.hifld, (table) => {
    table.float("LONGITUDE");
    table.float("LATITUDE");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.table(Tables.hifld, (table) => {
    table.dropColumn("LONGITUDE");
    table.dropColumn("LATITUDE");
  });
}
