import * as Knex from "knex";
import { Tables } from "../constants";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable(Tables.hifld, (table) => {
    table.increments();
    table.integer("FID");
    table.integer("FACILITYID").unique().notNullable();
    table.text("NAME");
    table.text("ADDRESS");
    table.text("CITY");
    table.text("STATE");
    table.integer("ZIP");
    table.integer("ZIP4");
    table.text("TELEPHONE");
    table.text("TYPE");
    table.text("STATUS");
    table.integer("POPULATION");
    table.text("COUNTY");
    table.integer("COUNTYFIPS");
    table.text("COUNTRY");
    table.integer("NAICS_CODE");
    table.text("NAICS_DESC");
    table.text("SOURCE");
    table.text("SOURCEDATE");
    table.text("VAL_METHOD");
    table.text("VAL_DATE");
    table.text("WEBSITE");
    table.text("SECURELVL");
    table.integer("CAPACITY");
    table.float("SHAPE_Leng");
    table.float("SHAPE_Length");
    table.float("SHAPE_Area");

    table.index(["FACILITYID"], "hifld_FACILITYID");
  });

  await knex.schema.createTable(Tables.canonicalFacilities, (table) => {
    table.increments();
    table.timestamps(true, true);
    table.string("uid");
    table.unique(["uid"]);

    table
      .integer("HIFLDID")
      .references("FACILITYID")
      .inTable(Tables.hifld)
      .onDelete("SET NULL");
    table.integer("UCLACovid19ID");
    table.boolean("hidden");

    // override fields
    table.float("longitude");
    table.float("latitude");
    table.text("name");
    table.integer("jurisdiction");
    table.text("address");
    table.text("city");
    table.integer("zip");
    table.text("state");
    table.text("county");
    table.integer("countyFIPS");
    table.integer("population");
    table.integer("capacity");

    table.specificType("notes", "text[]");
    table.index(["uid"], "canf_uid");
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
    table.string("created");
    table.boolean("hidden_override");

    table.specificType("notes", "text[]");

    table.index(["canonicalFacilityId"], "canonicalFacilityId_f_key");
    table.index(["company"], "companyFacilities_company");
    table.index(["stateInternal"], "companyFacilities_stateInternal");
    table.index(["uid"], "compf_uid");
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
    table.specificType("updated", "timestamptz[]");
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
