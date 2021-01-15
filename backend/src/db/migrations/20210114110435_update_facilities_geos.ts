import * as Knex from "knex";
import { Tables } from "../constants";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.table(Tables.facilities, (t) => {
    t.string("formatted_address");
    t.string("google_place_id");
    t.string("google_name");

    t.integer("congressional_id").references("id")
    .inTable(Tables.congressional_districts).onDelete("SET NULL");
    t.integer("state_id").references("id").inTable(Tables.states).onDelete("SET NULL");
    t.integer("county_id").references("id").inTable(Tables.counties).onDelete("SET NULL");

  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.table(Tables.facilities, (t) => {
    t.dropColumn("formatted_address");
    t.dropColumn("google_place_id");
    t.dropColumn("google_name");
    t.dropColumn("congressional_id");
    t.dropColumn("state_id");
    t.dropColumn("county_id");
  });
}
