import * as Knex from "knex";
import { Tables } from "../constants";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable(Tables.congressional_districts, (table) => {
    table.increments();
    table.timestamps(true, true);

    table.text("fips");
    table.text("state_fips");
    table.text("name");
  });

  await knex.schema.createTable(Tables.states, (table) => {
    table.increments();
    table.timestamps(true, true);

    table.text("fips");
    table.text("stusab");
    table.text("name");
  });

  await knex.schema.createTable(Tables.counties, (table) => {
    table.increments();
    table.timestamps(true, true);

    table.text("fips");
    table.text("state_fips");
    table.text("name");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable(Tables.congressional_districts);
  await knex.schema.dropTable(Tables.states);
  await knex.schema.dropTable(Tables.counties);
}
