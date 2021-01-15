import * as Knex from "knex";
import { Tables } from "../constants";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable(Tables.facilities, (table) => {
    table.increments();
    table.timestamps(true, true);

    table.string("name");
    table.integer("congressional_fips");
    table.integer("state_fips");
    table.integer("county_fips");
    table.float("longitude");
    table.float("latitude");

    table
      .integer("agency_id")
      .references("id")
      .inTable(Tables.agencies)
      .onDelete("SET NULL")
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable(Tables.facilities);
}
