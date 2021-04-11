import * as csv from "fast-csv";
// import github from "octonode";
import * as functions from "firebase-functions";
import {
  IRate,
  IRatePublic,
  ICanonicalFacility,
  ICanonicalFacilityPublic,
  ICompanyFacility,
  ICompanyFacilityPublic,
  State,
  Company,
  Service,
} from "../../../../types/index";
import * as db from "../../../../db/models";
import { Octokit } from "@octokit/core";
import * as storage from "../storage";
// var querystring = require("querystring");

export abstract class Exporter<I, O> {
  client: any;
  dbModel: any;
  abstract PATH: string;
  abstract CLOUD_STORAGE_PATH: string;

  constructor(dbModel: any) {
    this.client = new Octokit({ auth: functions.config().csv_db.token });
    this.dbModel = dbModel;
  }

  serialize(data: O[]): Promise<string> {
    return new Promise((res, rej) => {
      let cs = "";
      const csvStream = csv.format({ headers: true });
      csvStream.on("end", () => res(cs));
      csvStream.on("error", (err) => rej(err));
      csvStream.on("data", (d) => (cs += d));
      data.forEach((elt) => csvStream.write(elt));
      csvStream.end();
    });
  }

  async sync() {
    try {
      const update: I[] = await this.dbModel.query();
      const transformed = await this.transform(this.deleteDBMeta(update));
      const serialized = await this.serialize(transformed);

      const { data } = await this.client.request(
        `GET /repos/{owner}/{repo}/git/trees/{branch_name}:{parent_path}`,
        {
          owner: "PTDP",
          repo: "data",
          branch_name: "main",
          parent_path: "data",
        }
      );

      const { sha } = data.tree.find((t: any) => this.PATH.includes(t.path));

      const path = await storage.stringToPath(
        serialized,
        this.CLOUD_STORAGE_PATH
      );

      console.log(path);

      // https://api.github.com/repos/PTDP/data/git/trees/main:data

      // console.log(res);

      await this.client.request("PUT /repos/{owner}/{repo}/contents/{path}", {
        owner: "PTDP",
        repo: "data",
        content: Buffer.from(
          `# Latest CSV\n#### This CSV can be opened with common spreadsheet software like Excel and Google Sheets!\n✅ [${new Date().toLocaleString()}](${path})`
        ).toString("base64"),
        message: `${Date.now()} update`,
        path: this.PATH,
        sha,
      });
    } catch (err) {
      console.error(err);
    }
  }

  deleteDBMeta(data: any[]): any[] {
    return data.map((d) => {
      delete d.id;
      delete d.created_at;
      delete d.updated_at;
      return d;
    });
  }

  abstract transform(data: I[]): Promise<O[]>;
}

export class CompanyFacilityModel extends Exporter<
  ICompanyFacility,
  ICompanyFacilityPublic
> {
  PATH = "data/company_facilities.md";
  CLOUD_STORAGE_PATH = `exports/company_facilities_${Date.now()}.csv`;

  async transform(fs: ICompanyFacility[]) {
    return fs.map((r: ICompanyFacility) => {
      return {
        ...r,
        stateInternal: r.stateInternal ? State[r.stateInternal] : null,
        company: Company[r.company],
        notes: null, // hide CF Notes
      };
    });
  }
}

export class RateModel extends Exporter<IRate, IRatePublic> {
  PATH = "data/rates.md";
  CLOUD_STORAGE_PATH = `exports/rates_${Date.now()}.csv`;

  async transform(rates: IRate[]): Promise<IRatePublic[]> {
    const transformed: IRatePublic[] = [];
    for (let i = 0; i < rates.length; i++) {
      console.log(`${i}/${rates.length}`);
      const r = rates[i];
      const flattened = [];

      const cf = await db.CompanyFacility.query().findOne(
        "id",
        "=",
        r.companyFacilityId
      );

      const canon = await db.CanonicalFacility.query().findOne(
        "id",
        "=",
        cf.canonicalFacilityId
      );

      let hifld = null;

      if (canon) {
        hifld = await db.HIFLD.query().findOne(
          "FACILITYID",
          "=",
          canon.HIFLDID
        );
      }

      for (let i = 0; i < r.updated.length; i++) {
        if (!canon) continue;

        const publicRate = {
          facilityUID: canon?.uid,
          HIFLDID: canon?.HIFLDID,

          facility: hifld?.NAME,

          facilityInternal: cf?.facilityInternal?.toUpperCase() || "",
          agencyInternal: cf?.agencyInternal?.toUpperCase() || "",
          agencyFullNameInternal:
            cf?.agencyFullNameInternal?.toUpperCase() || "",

          address: hifld?.ADDRESS,
          city: hifld?.CITY,
          state: hifld?.STATE,
          zip: hifld?.ZIP,
          countyfips: hifld?.COUNTYFIPS,

          longitude: canon?.longitude || "",
          latitude: canon?.latitude || "",

          type: hifld?.TYPE,
          population: hifld?.POPULATION === -999 ? "" : hifld?.POPULATION,
          capacity: hifld?.CAPACITY === -999 ? "" : hifld?.CAPACITY,
          securelvl:
            hifld?.SECURELVL === "NOT AVAILABLE" ? "" : hifld?.SECURELVL,

          ...r,
          inState: r.inState,
          company: Company[r.company],
          service: Service[r.service].toUpperCase(),

          hidden: canon?.hidden,

          createdAt: new Date(r.updated[i]).toISOString(),
        };

        if (!publicRate.pctTax) publicRate.pctTax = 0;

        delete (publicRate as any).uid;
        delete (publicRate as any).updated;
        delete (publicRate as any).notes;
        delete (publicRate as any).hidden_override;
        delete (publicRate as any).companyFacilityId;
        delete (publicRate as any).companyFacilityId;

        flattened.push(publicRate as any);
      }

      transformed.push(...flattened);
    }
    return transformed;
  }
}

export class CanonicalFacilityModel extends Exporter<
  ICanonicalFacility,
  ICanonicalFacilityPublic
> {
  PATH = "data/canonical_facilities.md";
  CLOUD_STORAGE_PATH = `exports/canonical_facilities_${Date.now()}.csv`;

  async transform(fs: ICanonicalFacility[]) {
    return fs.map((r) => {
      return {
        ...r,
        notes: r.notes.length ? JSON.stringify(r.notes) : null,
      };
    });
  }
}

export const CompanyFacility = new CompanyFacilityModel(db.CompanyFacility);
export const Rate = new RateModel(db.Rate);
export const CanonicalFacility = new CanonicalFacilityModel(
  db.CanonicalFacility
);
