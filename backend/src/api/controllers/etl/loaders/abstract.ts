import { ScrapeResult, ICSRate, SecurusRate } from "@ptdp/lib";
import { sha1 } from "./util";
import { ICompanyFacility, IRate } from "../../../../types";
import * as db from "../../../../db/models";

import s_1 from "../../../../constants/scraper_input/8d92f5a0-61fa-44be-a535-efc6af2491e7.json";
const scrapeInputs = [s_1];

const removeDuplicates = <T>(
  r: T[],
  identifier: (elt: T) => string,
  itemType: string
) => {
  const seen = new Set();
  const filteredArr = r.filter((el) => {
    const duplicate = seen.has(identifier(el));
    seen.add(identifier(el));
    return !duplicate;
  });
  console.warn(
    "Removed ",
    r.length - filteredArr.length,
    " duplicate " + itemType
  );
  return filteredArr;
};

export default abstract class ETL {
  constructor(private result: ScrapeResult<ICSRate | SecurusRate>) {}

  async run(): Promise<void> {
    try {
      const tCompanyFacilities = await this.transformCompanyFacilities(
        this.result
      );

      await this.loadCompanyFacilities(tCompanyFacilities);
      const tRates = await this.transformRates(this.result);
      await this.loadRates(tRates);
    } catch (err) {
      console.error(err.toString());
    }
  }

  rateUniqueIdentitifier(e: IRate) {
    return sha1(
      "" +
        e.durationInitial +
        e.durationAdditional +
        e.amountInitial +
        e.amountAdditional +
        e.pctTax +
        e.phone +
        e.inState +
        e.service +
        e.source +
        e.company +
        e.companyFacilityId
    );
  }

  companyFacilityUniqueIdentifier(e: ICompanyFacility) {
    return sha1(
      "" +
        e.facilityInternal +
        (e.agencyInternal || "") +
        e.company +
        e.stateInternal
    );
  }

  validRate(r: IRate) {
    return r.amountInitial !== null && r.amountAdditional !== null;
  }

  async loadCompanyFacilities(transformed: ICompanyFacility[]): Promise<void> {
    const existing = await db.CompanyFacility.query();
    const deDupedWDB: ICompanyFacility[] = [];

    const dedupedWSelf = removeDuplicates(
      transformed,
      this.companyFacilityUniqueIdentifier,
      "Company Facilities from input"
    );

    dedupedWSelf.forEach((tf) => {
      if (
        !existing.find((exst) => {
          return (
            this.companyFacilityUniqueIdentifier(exst) ===
            this.companyFacilityUniqueIdentifier(tf)
          );
        })
      ) {
        deDupedWDB.push({
          uid: this.companyFacilityUniqueIdentifier(tf),
          ...tf,
        });
      }
    });

    await db.CompanyFacility.query().insert(deDupedWDB);

    console.log("Inserted ", deDupedWDB.length, " companyFacilities");
  }

  abstract transformRates(
    result: ScrapeResult<ICSRate | SecurusRate>
  ): Promise<IRate[]>;

  abstract transformCompanyFacilities(
    result: ScrapeResult<ICSRate | SecurusRate>
  ): ICompanyFacility[];

  async loadRates(transformed: IRate[]) {
    const existingRates = await db.Rate.query().select("*");
    const toInsert: IRate[] = [];

    const deduped = removeDuplicates(
      transformed,
      this.rateUniqueIdentitifier,
      "rates from input"
    );

    const filtered = deduped.filter(this.validRate);
    console.warn("Removed", deduped.length - filtered.length, " invalid rates");

    let patched = 0;
    let matches = 0;
    for (let i = 0; i < filtered.length; i++) {
      const r = filtered[i];
      const match = existingRates.find((e) => {
        return (
          this.rateUniqueIdentitifier(e) === this.rateUniqueIdentitifier(r)
        );
      });

      if (match) {
        matches += 1;
        if (match.updated.find((date) => date === r.updated.find(Boolean))) {
          continue;
        }
        const updated = [...new Set([...match.updated, ...r.updated])];
        const notes = [...new Set([...match.notes, ...r.notes])];
        updated.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
        await match.$query().patch({
          updated,
          notes,
        });

        patched += 1;
      } else {
        toInsert.push({ uid: this.rateUniqueIdentitifier(r), ...r });
      }
    }

    await db.Rate.query().insert(toInsert);

    console.log("Total rates ingested", transformed.length);
    console.log("Matches found", matches);
    console.log("Patched ", patched, " rates");
    console.log("Inserted ", toInsert.length, " rates");
  }

  strToInt = (str: string): number =>
    parseInt(str.match(new RegExp(/\d+/))?.[0] || "0");

  isInState = (rate: ICSRate | SecurusRate, stusab: string): boolean => {
    const scraper = scrapeInputs.find((si) => si.uuid === rate.scraper);
    if (!scraper)
      throw new Error(`Scraper not found for ` + JSON.stringify(rate));
    return (scraper["data"] as any)[stusab].in_state_phone === rate.number;
  };
}
