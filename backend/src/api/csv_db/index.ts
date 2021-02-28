// import * as fs from "fs";
// import * as path from "path";
import * as csv from "fast-csv";
import github from "octonode";
import * as functions from "firebase-functions";
import crypto from "crypto";
// import { firebaseConfig } from "firebase-functions";
// import { facilities } from "../controllers/etl/transformers/geocode";
// import Facility from "../models/facility";
// import { User } from './models/user';

// interface FacilityCSVRow {
//   id: string;
//   first_name: string;
//   last_name: string;
//   address: string;
// }

interface IFacility {
  id: string;
  name: string;
  jurisdiction?: "state" | "county" | "federal" | "immigration";
  agency: string;
  createdAt: string; //
  source: string;
  populationFeb20?: number;
  residentsPopulation?: number;
  state: string;
  address: string;
  zipcode: number;
  city: string;
  county: string;
  latitude: number;
  longitude: number;
  countyFIPS: number;
  HIFLID?: number;
  rawName: string;
}

const duplicatePrimaryKey = (arr: IFacility[]) => {
  const dupes: string[] = [];

  const seen = new Set();
  arr.some((curr) => {
    const dupe = seen.size === seen.add(curr.id).size;
    if (dupe) dupes.push(curr.id);
    return dupe;
  });

  return dupes.length ? dupes : false;
};

export const sha256 = (str: string) =>
  crypto.createHash("sha256").update(str).digest("hex");

class FacilityModel {
  ghrepo: any;
  FACILITIES_PATH = "data/facilities.csv";

  constructor() {
    const client = github.client(functions.config().csv_db.token);
    this.ghrepo = client.repo("PTDP/data");
  }

  query(): Promise<IFacility[]> {
    return new Promise(async (resolve, reject) => {
      const result = await this.ghrepo.contentsAsync(this.FACILITIES_PATH);
      const buff = Buffer.from(result[0].content, "base64");
      let facilities = buff.toString();
      const facilitiesArray: IFacility[] = [];

      const stream = csv
        .parse({ headers: true })
        .on("data", (row: IFacility) => {
          facilitiesArray.push({
            id: row.id,
            name: row.name,
            jurisdiction: row.jurisdiction,
            agency: row.agency,
            createdAt: row.createdAt,
            source: row.source,
            populationFeb20: row.populationFeb20,
            residentsPopulation: row.residentsPopulation,
            state: row.state,
            address: row.address,
            zipcode: row.zipcode,
            city: row.city,
            county: row.county,
            latitude: row.latitude,
            longitude: row.longitude,
            countyFIPS: row.countyFIPS,
            HIFLID: row.HIFLID,
            rawName: row.rawName,
          });
        })
        .on("error", (error) => {
          console.error(error);
          reject(error);
        })
        .on("end", () => resolve(facilitiesArray));

      stream.write(facilities);
      stream.end();
    });
  }

  validate(facilites: IFacility[]) {
    const dupes = duplicatePrimaryKey(facilites);
    if (dupes) {
      throw new Error("Duplicates: " + JSON.stringify(dupes));
    }
    return true;
  }

  serialize(facilities: IFacility[]): Promise<string> {
    return new Promise((res, rej) => {
      let cs = "";
      const csvStream = csv.format({ headers: true });
      csvStream.on("end", () => res(cs));
      csvStream.on("error", (err) => rej(err));
      csvStream.on("data", (d) => (cs += d));
      facilities.forEach((elt) => csvStream.write(elt));
      csvStream.end();
    });
  }

  async insert(facilities: IFacility[]) {
    const current = await this.query();

    facilities.forEach((f) => current.push(f));
    this.validate(current);

    const serialized = await this.serialize(current);
    const r = await this.ghrepo.contentsAsync(this.FACILITIES_PATH);

    await this.ghrepo.updateContentsAsync(
      this.FACILITIES_PATH,
      "Update " + Math.floor(Date.now() / 1000),
      serialized,
      r[0].sha,
      "main"
    );
  }
}

export const Facility = new FacilityModel();
