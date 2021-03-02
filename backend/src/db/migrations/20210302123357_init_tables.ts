import * as Knex from "knex";
import { Tables } from "../constants";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable(Tables.canonicalFacilities, (table) => {
    table.increments();
    table.timestamps(true, true);

    table.text("name");
    table.integer("jurisdiction");
    table.text("address");
    table.text("googlePlaceName");
    table.float("longitude");
    table.float("latitude");
    table.integer("state");
    table.text("county");
    table.integer("countyFIPS");
    table.integer("HIFLDID");
    table.integer("HIFLD_POPULATION");
    table.integer("HIFLD_CAPACITY");
    table.text("HIFLD_SOURCE");
    table.text("HIFLD_SOURCEDATE");
    table.integer("UCLACovid19ID");
    table.integer("UCLACovid19_POPULATION");
    table.text("UCLACovid19_SOURCE");
    table.text("UCLACovid19_SOURCEDATE");

    table.index(["state"], "cf_state_id");
    table.index(["state"], "cf_jurisdiction_id");
  });

  await knex.schema.createTable(Tables.companyFacilities, (table) => {
    table.increments();
    table.timestamps(true, true);

    table.text("facilityInternal");
    table.text("agencyInternal");
    table.integer("stateInternal");
    table.integer("company");
    table
      .integer("canonicalFacilityId")
      .references("id")
      .inTable(Tables.canonicalFacilities)
      .onDelete("SET NULL");
    table.string("createdAt");

    table.index(["canonicalFacilityId"], "canonicalFacilityId_f_key");
    table.index(["company"], "companyFacilities_company");
    table.index(["stateInternal"], "companyFacilities_stateInternal");
  });

  await knex.schema.createTable(Tables.rates, (table) => {
    table.increments();
    table.timestamps(true, true);

    table.integer("durationInitial");
    table.integer("durationAdditional");
    table.float("amountInitial");
    table.float("amountAdditional");
    table.float("pctTax");
    table.text("phone");
    table.boolean("inState");
    table.integer("service");
    table.text("source");
    table.integer("company");
    table
      .integer("companyFacilityId")
      .references("id")
      .inTable(Tables.companyFacilities)
      .onDelete("SET NULL");
    table.specificType("updatedAt", "timestamptz[]");

    table.index(["companyFacilityId"], "rates_companyFacilityId_f_key");
    table.index(["company"], "rates_company");
    table.index(
      [
        "durationInitial",
        "durationAdditional",
        "amountInitial",
        "amountAdditional",
        "pctTax",
        "phone",
        "service",
      ],
      "rates_unique_lookup"
    );
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable(Tables.rates);
  await knex.schema.dropTable(Tables.companyFacilities);
  await knex.schema.dropTable(Tables.canonicalFacilities);
}
