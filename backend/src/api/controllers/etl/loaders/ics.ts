import { ScrapeResult, ICSRate } from "@ptdp/lib";

import ETL from "./abstract";
import {
  ICompanyFacility,
  IRate,
  Service,
  State,
  Company,
} from "../../../../types/index";
import * as db from "../../../../db/models";

class ICS extends ETL {
  constructor(result: ScrapeResult<ICSRate>) {
    super(result);
  }

  rateToCF(r: ICSRate, stusab: string) {
    return {
      facilityInternal: r.facility,
      agencyInternal: r.internalAgency,
      agencyFullNameInternal: r.internalAgencyFullName,
      stateInternal: State[stusab as any] as any,
      company: Company.ICS,
      created: new Date(r.createdAt).toISOString(),
      canonicalFacilityId: null,
      notes: [`Public Agencies: ${r.publicAgencies};`],
      hidden_override: false,
    };
  }

  transformCompanyFacilities(
    result: ScrapeResult<ICSRate>
  ): ICompanyFacility[] {
    const facilities: ICompanyFacility[] = [];

    Object.entries(result).forEach(([stusab, rates]) => {
      (rates as ICSRate[]).forEach((r: ICSRate): void => {
        facilities.push(this.rateToCF(r, stusab));
      });
    });

    return facilities;
  }

  async transformRates(result: ScrapeResult<ICSRate>): Promise<IRate[]> {
    const tf: IRate[] = [];
    const entries = Object.entries(result);

    const companyFacilities = await db.CompanyFacility.query();

    for (let j = 0; j < entries.length; j++) {
      let [stusab, rates] = entries[j] as [string, ICSRate[]];
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
          // console.warn(
          //   "No facility has been added to database for " +
          //     r.facility +
          //     "this is probably intentional"
          // );
          continue;
          // throw new Error("Could not find facility for " + JSON.stringify(r));
        }

        const partial = {
          durationInitial: r.initialDuration
            ? this.strToInt(r.initialDuration) * 60
            : null,
          durationAdditional: r.overDuration
            ? this.strToInt(r.overDuration) * 60
            : null,
          amountInitial: r.initialCost
            ? parseFloat(r.initialCost.toFixed(2))
            : null,
          amountAdditional: r.overCost
            ? parseFloat(r.overCost.toFixed(2))
            : null,
          pctTax: r.tax
            ? parseFloat(((r.tax / (r.seconds / 60)) as any).toFixed(2))
            : null,
          phone: r.number,
          inState: this.isInState(r, stusab),
          company: Company.ICS,
          source: "https://icsonline.icsolutions.com/rates",
          service: Service.Default,
          updated: [new Date(r.createdAt).toISOString()],
          companyFacilityId: cf.id,
          notes: [],
          hidden_override: false,
        };

        tf.push(partial);
      }
    }

    return tf;
  }
}

export default ICS;
