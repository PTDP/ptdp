import { JoinedCompanyFacility, ICanonicalFacility } from "../../../../types";
import * as csv from "fast-csv";
import axios from "axios";
import CanonicalFacility from "../../../../db/models/canonical_facility";
// import { CompanyFacility } from "../../../../db/models";
import { Tables } from "../../../../db/constants";
// import CompanyFacility from "../../../../db/models/company_facility";
import connection from "../../../../db";

export default class CanonicalLoader {
  URL =
    "https://raw.githubusercontent.com/PTDP/data/main/intermediate_data/joined_company_facilities.csv";

  HIFLD_URL =
    "https://opendata.arcgis.com/datasets/2d6109d4127d458eaf0958e4c5296b67_0.csv?outSR=%7B%22latestWkid%22%3A3857%2C%22wkid%22%3A102100%7D";

  constructor() {}

  parse(data: string): Promise<JoinedCompanyFacility[]> {
    return new Promise((res, rej) => {
      const out: JoinedCompanyFacility[] = [];
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
        hidden: (c as any).hidden === "True" ? true : false,
        HIFLDID: c.HIFLDID ? parseInt((c as any).HIFLDID) : null,
        UCLACovid19ID: c.UCLACovid19ID || null,
        name_override: c.name_override || null,
        jurisdiction_override: c.jurisdiction_override || null,
        address_override: c.address_override || null,
        longitude_override: c.longitude_override || null,
        latitude_override: c.latitude_override || null,
        state_override: c.state_override || null,
        county_override: c.county_override || null,
        countyFIPS_override: c.countyFIPS_override || null,
        HIFLDID_override: c.HIFLDID_override || null,
        UCLACovid19ID_override: c.UCLACovid19ID_override || null,
        hidden_override: c.hidden_override || null,
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

  async run() {
    console.log("Clearing");
    await this.clearOldCanonical();

    console.log("Inserting");
    await this.insertNewCanonical();

    console.log("Linking");
    await this.linkNewCanonicalToCompany();

    console.log("Finished");
  }
}
