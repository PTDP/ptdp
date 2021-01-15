import * as Knex from "knex";
import { Tables } from "../constants";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable(Tables.canonical_rates, (table) => {
    table.increments();
    table.timestamps(true, true);

    table
      .integer("company_id")
      .references("id")
      .inTable(Tables.companies)
      .onDelete("SET NULL");
    table
      .integer("facility_id")
      .references("id")
      .inTable(Tables.facilities)
      .onDelete("SET NULL");
    table
      .integer("service_id")
      .references("id")
      .inTable(Tables.services)
      .onDelete("SET NULL");

    table.text("phone_number");
    table.text("notes");
    table.boolean("disabled");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable(Tables.canonical_rates);
}
