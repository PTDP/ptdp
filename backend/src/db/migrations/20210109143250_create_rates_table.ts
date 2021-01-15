import * as Knex from "knex";
import { Tables } from "../constants";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable(Tables.rates, (table) => {
    table.increments();
    table.timestamps(true, true);

    table.float("initial_amount");
    table.float("additional_amount");
    table.float("initial_duration");
    table.float("over_duration");
    table.float("tax");
    table.text("phone_number");

    table.specificType("seen_at", "timestamptz[]");

    table.json("raw");

    table
      .integer("scraper_id")
      .references("id")
      .inTable(Tables.scrapers)
      .onDelete("SET NULL");
    table
      .integer("canonical_rate_id")
      .references("id")
      .inTable(Tables.canonical_rates)
      .onDelete("SET NULL");
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable(Tables.rates);
}
