import * as csv from "fast-csv";
import axios from "axios";

import CanonicalFacility from "../../../../db/models/canonical_facility";
import HIFLD from "../../../../db/models/hifld";
import { Tables } from "../../../../db/constants";
import connection from "../../../../db";
import {
  JoinedCompanyFacility,
  ICanonicalFacility,
  HIFLD as HIFLDData,
} from "../../../../types";

export default class CanonicalLoader {
  URL =
    "https://raw.githubusercontent.com/PTDP/data/main/intermediate_data/joined_company_facilities.csv";

  HIFLD_URL =
    "https://opendata.arcgis.com/datasets/2d6109d4127d458eaf0958e4c5296b67_0.csv?outSR=%7B%22latestWkid%22%3A3857%2C%22wkid%22%3A102100%7D";

  HIFLD_GEOCODED_URL =
    "https://raw.githubusercontent.com/PTDP/data/main/intermediate_data/hifld_geocoded.csv";

  constructor() {}

  parse(data: string): Promise<any[]> {
    return new Promise((res, rej) => {
      const out: any[] = [];
      const stream = csv
        .parse({ headers: true })
        .on("error", (error) => rej(error))
        .on("data", (row) => out.push(row))
        .on("end", (rowCount: number) => res(out));

      stream.write(data);
      stream.end();
      return out;
    });
  }

  async clearOldCanonical() {
    await CanonicalFacility.query().del();
  }

  async insertNewCanonical() {
    const csv = (await axios.get(this.URL)).data;

    const parsed: JoinedCompanyFacility[] = await this.parse(csv);
    const insertables: ICanonicalFacility[] = [];

    for (const c of parsed) {
      insertables.push({
        uid: c.uid,
        longitude: c.longitude_override || c.longitude || null,
        latitude: c.latitude_override || c.latitude || null,
        hidden: (c as any).hidden === "True" ? true : false,
        HIFLDID: c.HIFLDID
          ? parseInt((c as any).HIFLDID_override || c.HIFLDID)
          : null,
        UCLACovid19ID: c.UCLACovid19ID_override || c.UCLACovid19ID || null,

        name: c.name || null,
        jurisdiction: c.jurisdiction_override || null,
        address: c.address_override || null,
        city: c.city_override || null,
        zip: c.zip_override || null,
        state: (c as any).state_override || null,
        county: c.county_override || null,
        countyFIPS: c.countyFIPS_override || null,
        population: c.population_override || null,
        capacity: c.capacity_override || null,
        notes: [],
      });
    }

    await CanonicalFacility.query().insert(insertables);
  }

  linkNewCanonicalToCompany() {
    return connection.transaction(async (trx) => {
      const cf = await CanonicalFacility.query();
      const queries: any[] = [];
      cf.forEach((canonical) => {
        const query = connection(Tables.companyFacilities)
          // this may not hold in the future if we consolidated canonical facilities
          .where("uid", canonical.uid)
          .update({
            canonicalFacilityId: canonical.id,
          })
          .transacting(trx);
        queries.push(query);
      });

      await Promise.all(queries).then(trx.commit).catch(trx.rollback);
    });
  }

  async clearOldHIFLD() {
    await HIFLD.query().del();
  }

  async insertNewHIFLD() {
    const csv = (await axios.get(this.HIFLD_GEOCODED_URL)).data;
    const parsed: HIFLDData[] = (await this.parse(csv)).map((elt) => ({
      ...elt,
      FID: parseInt(elt.FID) || null,
      FACILITYID: parseInt(elt.FACILITYID) || null,
      ZIP: parseInt(elt.ZIP) || null,
      ZIP4: parseInt(elt.ZIP4) || null,
      POPULATION: parseInt(elt.POPULATION) || null,
      COUNTYFIPS: parseInt(elt.COUNTYFIPS) || null,
      NAICS_CODE: parseInt(elt.NAICS_CODE) || null,
      CAPACITY: parseInt(elt.CAPACITY) || null,
      SHAPE_Leng: parseFloat(elt.SHAPE_Leng) || null,
      SHAPE_Length: parseFloat(elt.SHAPE_Length) || null,
      SHAPE_Area: parseFloat(elt.SHAPE_Area) || null,
      LONGITUDE: parseFloat(elt.LONGITUDE) || null,
      LATITUDE: parseFloat(elt.LATITUDE) || null,
    }));

    await connection.batchInsert(Tables.hifld, parsed, 1000);
  }

  async run() {
    console.log("Clearing HIFLD");
    await this.clearOldHIFLD();

    console.log("Inserting HIFLD");
    await this.insertNewHIFLD();

    console.log("Clearing Canonical");
    await this.clearOldCanonical();

    console.log("Inserting Canonical");
    await this.insertNewCanonical();

    console.log("Linking Canonical");
    await this.linkNewCanonicalToCompany();

    console.log("Finished");
  }
}
