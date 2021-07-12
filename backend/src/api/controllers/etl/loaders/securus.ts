import { ScrapeResult, SecurusRate } from "@ptdp/lib";
import ETL from "./abstract";
import {
  ICompanyFacility,
  IRate,
  Service,
  State,
  Company,
} from "../../../../types/index";
import * as db from "../../../../db/models";

class Securus extends ETL {
  constructor(result: ScrapeResult<SecurusRate>) {
    super(result);
  }

  rateToCF(r: SecurusRate, stusab: string) {
    return {
      facilityInternal: r.facility,
      stateInternal: State[stusab as any] as any,
      company: Company.SECURUS,
      agencyInternal: null,
      agencyFullNameInternal: null,
      created: new Date(r.createdAt).toISOString(),
      canonicalFacilityId: null,
      notes: [],
      hidden_override: false,
    };
  }

  transformCompanyFacilities(
    result: ScrapeResult<SecurusRate>
  ): ICompanyFacility[] {
    const facilities: ICompanyFacility[] = [];

    Object.entries(result).forEach(([stusab, rates]) => {
      (rates as SecurusRate[]).forEach((r: SecurusRate): void => {
        facilities.push(this.rateToCF(r, stusab));
      });
    });

    return facilities;
  }

  async transformRates(result: ScrapeResult<SecurusRate>): Promise<IRate[]> {
    const tf: IRate[] = [];
    const entries = Object.entries(result);

    const companyFacilities = await db.CompanyFacility.query();

    for (let j = 0; j < entries.length; j++) {
      let [stusab, rates] = entries[j] as [string, SecurusRate[]];
      for (let i = 0; i < rates.length; i++) {
        const r = rates[i];

        const cf = companyFacilities.find(
          (cf) =>
            this.companyFacilityUniqueIdentifier(cf) ===
            this.companyFacilityUniqueIdentifier(
              this.rateToCF(rates[i], stusab)
            )
        );

        if (!cf) {
          throw new Error("Could not find facility for " + JSON.stringify(r));
        }

        const partial = {
          durationInitial: r.seconds,
          durationAdditional: r.seconds,
          amountInitial: r.initalAmount
            ? parseFloat(parseFloat(r.initalAmount.replace("$", "")).toFixed(2))
            : null,
          amountAdditional: r.additionalAmount
            ? parseFloat(
                parseFloat(r.additionalAmount.replace("$", "")).toFixed(2)
              )
            : null,
          pctTax: 0,
          phone: r.number!,
          inState: this.isInState(r, stusab),
          company: Company.SECURUS,
          source: "https://securustech.online/#/rate-quote",
          service: Service[r.service],
          updated: [new Date(r.createdAt).toISOString()],
          companyFacilityId: cf.id,
          notes: [],
          hidden_override: false,
        };

        tf.push(partial as any);
      }
    }

    return tf;
  }
}

export default Securus;
