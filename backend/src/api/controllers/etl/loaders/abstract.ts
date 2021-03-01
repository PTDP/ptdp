import { ScrapeResult, ICSRate, SecurusRate } from "@ptdp/lib";
import { sha1 } from "./util";
import { IContract, IRate } from "../../../../types";
import * as db from "../../../csv_db";

import s_1 from "../../../../constants/scraper_input/8d92f5a0-61fa-44be-a535-efc6af2491e7.json";
const scrapeInputs = [s_1];

export default abstract class ETL {
  constructor(private result: ScrapeResult<ICSRate | SecurusRate>) {}

  async run(): Promise<void> {
    try {
      const tContracts = await this.transformContracts(this.result);
      await this.loadContracts(tContracts);

      const tRates = await this.transformRates(this.result);
      await this.loadRates(tRates);
    } catch (err) {
      console.error(err.toString());
    }
  }

  rawToSha(raw: ICSRate | SecurusRate) {
    return sha1(JSON.stringify(this.removeRateMetadata(raw)));
  }

  facilitySha(identifier: string) {
    return sha1(identifier);
  }

  contractSha(
    facilityInternal: string,
    agencyInternal: string,
    company: string,
    stusab: string
  ) {
    return sha1(facilityInternal + agencyInternal + company + stusab);
  }

  rateSha(rate: ICSRate | SecurusRate) {
    return sha1(JSON.stringify(this.removeRateMetadata(rate)));
  }

  async loadContracts(transformed: IContract[]): Promise<void> {
    const existing = await db.Contract.query();
    const n: IContract[] = [];

    transformed.forEach((tf) => {
      if (!existing.find((exst) => exst.id === tf.id)) {
        n.push(tf);
      }
    });

    await db.Contract.insert(n);
    console.log("Inserted ", n.length, " facilities");
  }

  abstract transformRates(
    result: ScrapeResult<ICSRate | SecurusRate>
  ): Promise<IRate[]>;

  abstract transformContracts(
    result: ScrapeResult<ICSRate | SecurusRate>
  ): IContract[];

  async loadRates(transformed: IRate[]) {
    const existingRates = await db.Rate.query();
    const toInsert: IRate[] = [];

    let patched = 0;

    transformed.forEach((r) => {
      const match = existingRates.findIndex((e) => e.id === r.id);
      if (match > -1) {
        const updated = { ...existingRates[match] };
        const n = [
          ...new Set([
            ...(JSON.parse(existingRates[match].updatedAt) as string[]),
            ...(JSON.parse(r.updatedAt) as string[]),
          ]),
        ];

        n.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
        updated.updatedAt = JSON.stringify(n);

        existingRates[match] = updated;
        patched += 1;
      } else {
        toInsert.push(r);
      }
    });

    await db.Rate.update([...existingRates, ...toInsert]);

    console.log("Patched ", patched, " rates");
    console.log("Inserted ", toInsert.length, " rates");
  }

  removeRateMetadata = (
    raw: ICSRate | SecurusRate
  ): Omit<ICSRate | SecurusRate, "createdAt"> => {
    const r: ICSRate | SecurusRate = { ...raw };
    delete (r as any).createdAt;
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
