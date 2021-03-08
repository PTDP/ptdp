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
  Jurisdiction,
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
      const transformed = this.transform(this.deleteDBMeta(update));
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
      delete d.created_at;
      delete d.updated_at;
      return d;
    });
  }

  abstract transform(data: I[]): O[];
}

export class CompanyFacilityModel extends Exporter<
  ICompanyFacility,
  ICompanyFacilityPublic
> {
  PATH = "data/company_facilities.md";
  CLOUD_STORAGE_PATH = `exports/company_facilities_${Date.now()}.csv`;

  transform(fs: ICompanyFacility[]) {
    return fs.map((r) => ({
      ...r,
      stateInternal: r.stateInternal ? State[r.stateInternal] : null,
      company: Company[r.company],
      notes: null, // hide CF Notes
    }));
  }
}

export class RateModel extends Exporter<IRate, IRatePublic> {
  PATH = "data/rates.md";
  CLOUD_STORAGE_PATH = `exports/rates_${Date.now()}.csv`;

  transform(rates: IRate[]) {
    return rates.map((r) => ({
      ...r,
      service: Service[r.service],
      company: Company[r.company],
      updatedAt: JSON.stringify(r.updatedAt),
      notes: r.notes.length ? JSON.stringify(r.notes) : null,
    }));
  }
}

export class CanonicalFacilityModel extends Exporter<
  ICanonicalFacility,
  ICanonicalFacilityPublic
> {
  PATH = "data/canonical_facilities.md";
  CLOUD_STORAGE_PATH = `exports/canonical_facilities_${Date.now()}.csv`;

  transform(fs: ICanonicalFacility[]) {
    return fs.map((r) => ({
      ...r,
      jurisdiction: Jurisdiction[r.jurisdiction],
      notes: r.notes.length ? JSON.stringify(r.notes) : null,
    }));
  }
}

export const CompanyFacility = new CompanyFacilityModel(db.CompanyFacility);
export const Rate = new RateModel(db.Rate);
export const CanonicalFacility = new CanonicalFacilityModel(
  db.CanonicalFacility
);
