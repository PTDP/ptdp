import * as Knex from "knex";
import { Tables } from "../constants";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable(Tables.canonical_rates, (table) => {
    table.increments();
    table.timestamps(true, true);

    table.integer("company_id").references("id").inTable(Tables.companies);
    table.integer("facility_id").references("id").inTable(Tables.facilities);
    table.integer("service_id").references("id").inTable(Tables.services);

    table.text("phone_number");
    table.text("notes");
    table.boolean("disabled");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable(Tables.canonical_rates);
}
