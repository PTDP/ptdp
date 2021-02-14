import * as Knex from "knex";
import { Tables } from "../constants";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.table(Tables.rates, (t) => {
    t.index(["canonical_rate_id"], "canonical_rate_fkey");
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.table(Tables.rates, (t) => {
    t.dropIndex(["canonical_rate_id"], "canonical_rate_fkey");
  });
}
