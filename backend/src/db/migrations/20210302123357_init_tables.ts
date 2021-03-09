import * as Knex from "knex";
import { Tables } from "../constants";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable(Tables.canonicalFacilities, (table) => {
    table.increments();
    table.timestamps(true, true);
    table.string("uid");
    table.unique(["uid"]);

    table.integer("HIFLDID");
    table.integer("UCLACovid19ID");
    table.boolean("hidden");

    // override fields
    table.text("name_override");
    table.integer("jurisdiction_override");
    table.text("address_override");
    table.float("longitude_override");
    table.float("latitude_override");
    table.integer("state_override");
    table.text("county_override");
    table.integer("countyFIPS_override");
    table.integer("HIFLDID_override");
    table.integer("UCLACovid19ID_override");
    table.boolean("hidden_override");

    table.specificType("notes", "text[]");
    table.index(["state"], "cf_state_id");
    table.index(["state"], "cf_jurisdiction_id");
  });

  await knex.schema.createTable(Tables.companyFacilities, (table) => {
    table.increments();
    table.timestamps(true, true);
    table.string("uid");
    table.unique(["uid"]);

    table.text("facilityInternal");
    table.text("agencyInternal");
    table.text("agencyFullNameInternal");
    table.integer("stateInternal");
    table.integer("company");
    table
      .integer("canonicalFacilityId")
      .references("id")
      .inTable(Tables.canonicalFacilities)
      .onDelete("SET NULL");
    table.string("createdAt");
    table.boolean("hidden_override");

    table.specificType("notes", "text[]");

    table.index(["canonicalFacilityId"], "canonicalFacilityId_f_key");
    table.index(["company"], "companyFacilities_company");
    table.index(["stateInternal"], "companyFacilities_stateInternal");
  });

  await knex.schema.createTable(Tables.rates, (table) => {
    table.increments();
    table.timestamps(true, true);
    table.string("uid");
    table.unique(["uid"]);

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
    table.specificType("notes", "text[]");
    table.boolean("hidden_override");

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
