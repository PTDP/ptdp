import {
  ScrapeResult,
  ICSRate,
  SecurusRate,
  //   Stusab,
  //   Facility as FacilityData,
} from "@ptdp/lib";
import { sha1 } from "./util";
import { IFacility, IRate } from "../../../../types";
import * as db from "../../../csv_db";

import s_1 from "../../../../constants/scraper_input/8d92f5a0-61fa-44be-a535-efc6af2491e7.json";
const scrapeInputs = [s_1];

export default abstract class ETL {
  constructor(private result: ScrapeResult<ICSRate | SecurusRate>) {}

  async run(): Promise<void> {
    try {
      const tFacilities = await this.transformFacilities(this.result);
      await this.loadFacilities(tFacilities);

      const tRates = await this.transformRates(this.result);
      await this.loadRates(tRates);
    } catch (err) {
      console.error(err.toString());
    }
  }

  rawToSha(raw: ICSRate | SecurusRate) {
    return sha1(JSON.stringify(this.removeRateMetadata(raw)));
  }

  facilitySha(rawName: string, stusab: string) {
    return sha1(rawName + stusab);
  }

  rateSha(rate: ICSRate | SecurusRate) {
    return sha1(JSON.stringify(this.removeRateMetadata(rate)));
  }

  async loadFacilities(transformed: IFacility[]): Promise<void> {
    const existing = await db.Facility.query();
    const n: IFacility[] = [];

    transformed.forEach((tf) => {
      if (!existing.find((exst) => exst.id === tf.id)) {
        n.push(tf);
      }
    });

    await db.Facility.insert(n);
    console.log("Inserted ", n.length, " facilities");
  }

  abstract transformRates(
    result: ScrapeResult<ICSRate | SecurusRate>
  ): Promise<IRate[]>;

  abstract transformFacilities(
    result: ScrapeResult<ICSRate | SecurusRate>
  ): IFacility[];

  async loadRates(transformed: IRate[]) {
    const existingRates = await db.Rate.query();
    const toInsert: IRate[] = [];

    transformed.forEach((r) => {
      const match = existingRates.findIndex((e) => e.id === r.id);
      if (match > -1) {
        const updated = { ...existingRates[match] };
        updated.updatedAt = JSON.stringify([
          ...new Set([
            ...(JSON.parse(existingRates[match].updatedAt) as string[]),
            ...(JSON.parse(r.updatedAt) as string[]),
          ]),
        ]);
        existingRates[match] = updated;
      } else {
        toInsert.push(r);
      }
    });

    await db.Rate.update([...existingRates, ...toInsert]);

    console.log("Patched ", existingRates.length, " rates");
    console.log("Inserted ", toInsert.length, " rates");
  }

  removeRateMetadata = (
    raw: ICSRate | SecurusRate
  ): Omit<ICSRate | SecurusRate, "createdAt"> => {
    const r: ICSRate | SecurusRate = { ...raw };
    delete (r as any).updatedAt;
    return r;
  };

  strToInt = (str: string): number =>
    parseInt(str.match(new RegExp(/\d+/))?.[0] || "0");

  isInState = (rate: ICSRate | SecurusRate, stusab: string): boolean => {
    const scraper = scrapeInputs.find((si) => si.uuid === rate.scraper);
    if (!scraper)
      throw new Error(`Scraper not found for ` + JSON.stringify(rate));
    return (scraper["data"] as any)[stusab].in_state_phone === rate.number;
  };
}
