import * as Knex from "knex";
import { Tables } from "../constants";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.table(Tables.canonical_rates, (t) => {
    t.index(["facility_id"], "facility_id_fkey");
  });

  await knex.schema.table(Tables.canonical_rates, (t) => {
    t.index(["company_id"], "company_id_key");
  });

  await knex.schema.table(Tables.facilities, (t) => {
    t.index(["state_id"], "state_id_fkey");
  });

  await knex.schema.table(Tables.facilities, (t) => {
    t.index(["county_id"], "county_id_fkey");
  });

  await knex.schema.table(Tables.facilities, (t) => {
    t.index(["agency_id"], "agency_id_fkey");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.table(Tables.canonical_rates, (t) => {
    t.dropIndex(["facility_id"], "facility_id_fkey");
  });

  await knex.schema.table(Tables.canonical_rates, (t) => {
    t.dropIndex(["company_id"], "company_id_fkey");
  });

  await knex.schema.table(Tables.facilities, (t) => {
    t.dropIndex(["state_id"], "state_id_fkey");
  });

  await knex.schema.table(Tables.facilities, (t) => {
    t.dropIndex(["county_id"], "county_id_fkey");
  });

  await knex.schema.table(Tables.facilities, (t) => {
    t.dropIndex(["agency_id"], "agency_id_fkey");
  });
}
