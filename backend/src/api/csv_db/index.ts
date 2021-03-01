// import * as fs from "fs";
// import * as path from "path";
import * as csv from "fast-csv";
import github from "octonode";
import * as functions from "firebase-functions";
import crypto from "crypto";
import { IFacility, IRate } from "../../types/index";

const duplicatePrimaryKey = (arr: any[]) => {
  const dupes: string[] = [];

  const seen = new Set();
  arr.some((curr) => {
    const dupe = seen.size === seen.add(curr.id).size;
    if (dupe) dupes.push(curr.id);
    return dupe;
  });

  return dupes.length ? dupes : false;
};

const removeDuplicates = (arr: any[]) => {
  const seen = new Set();
  const filteredArr = arr.filter((el) => {
    const duplicate = seen.has(el.id);
    seen.add(el.id);
    return !duplicate;
  });
  console.warn("Removed ", arr.length - filteredArr.length, " duplicates");
  return filteredArr;
};

export const sha256 = (str: string) =>
  crypto.createHash("sha256").update(str).digest("hex");

abstract class Model<T> {
  ghrepo: any;
  abstract PATH: string;

  constructor() {
    const client = github.client(functions.config().csv_db.token);
    this.ghrepo = client.repo("PTDP/data");
  }

  validate(data: T[]) {
    const dupes = duplicatePrimaryKey(data);
    if (dupes) {
      throw new Error("Found duplicates " + dupes);
    }
    return true;
  }

  serialize(data: T[]): Promise<string> {
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

  query(): Promise<T[]> {
    return new Promise(async (resolve, reject) => {
      const result = await this.ghrepo.contentsAsync(this.PATH);
      const buff = Buffer.from(result[0].content, "base64");
      let facilities = buff.toString();
      const data: T[] = [];

      const stream = csv
        .parse({ headers: true })
        .on("data", (row: T) => {
          data.push({
            ...row,
          });
        })
        .on("error", (error) => {
          console.error(error);
          reject(error);
        })
        .on("end", () => resolve(data));

      stream.write(facilities);
      stream.end();
    });
  }

  fix(current: T[]) {
    return removeDuplicates(current);
  }

  async insert(inserts: T[]) {
    let current = await this.query();

    inserts.forEach((f) => current.push(f));

    const fixed = this.fix(current);

    const serialized = await this.serialize(fixed);
    const r = await this.ghrepo.contentsAsync(this.PATH);

    await this.ghrepo.updateContentsAsync(
      this.PATH,
      "Update " + Math.floor(Date.now() / 1000),
      serialized,
      r[0].sha,
      "main"
    );
  }

  async update(update: T[]) {
    const fixed = this.fix(update);
    this.validate(fixed);
    const serialized = await this.serialize(fixed);
    const r = await this.ghrepo.contentsAsync(this.PATH);

    await this.ghrepo.updateContentsAsync(
      this.PATH,
      "Update " + Math.floor(Date.now() / 1000),
      serialized,
      r[0].sha,
      "main"
    );
  }
}

export class FacilityModel extends Model<IFacility> {
  PATH = "data/facilities.csv";
}

export class RateModel extends Model<IRate> {
  PATH = "data/rates.csv";
}

export const Facility = new FacilityModel();
export const Rate = new RateModel();
