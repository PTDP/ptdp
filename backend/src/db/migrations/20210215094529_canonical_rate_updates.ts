import * as Knex from "knex";

import { Tables } from "../constants";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.table(Tables.canonical_rates, (t) => {
    t.integer("scraper_id")
      .references("id")
      .inTable(Tables.scrapers)
      .onDelete("SET NULL");

    t.boolean("in_state");

    t.index(["scraper_id"], "scraper_id_f_key");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.table(Tables.canonical_rates, async (t) => {
    t.dropColumn("scraper_id");
    t.dropColumn("in_state");
    t.dropIndex(["scraper_id"]);
  });
}
