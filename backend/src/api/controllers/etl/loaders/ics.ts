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
import states from "us-state-codes";

// To be deprecated after scraper rewrite
import ICS_PRODUCTS_1614890605816 from "../../../../constants/ics_products_1614890605816.json";

class ICS extends ETL {
  constructor(result: ScrapeResult<ICSRate>) {
    super(result);
  }

  // To be deprecated after scraper rewrite
  rateToCF(r: ICSRate, stusab: string) {
    const product = ICS_PRODUCTS_1614890605816.find(
      (p) => r.agency === p.full_nm
    );

    let sureOfState = false;
    // same product (so same internal agency, but listed stusab)
    if (product) {
      // we are sure of state if there are no agencies using
      // this particular product whose states are different that this state

      sureOfState = !ICS_PRODUCTS_1614890605816.find(
        (p) => product.agency_id === p.agency_id && p.state_cd !== stusab
      );

      if (r.facility === "Wisconsin Secure Program Facility - WSPF") {
        // console.log(sureOfState);

        if (!sureOfState) {
          console.log(stusab);
          // console.log(product.agency_id);
        }
        // console.log(stusab);
        // console.log(stusab);
      }
    }

    return {
      facilityInternal: r.facility,
      productInternal: product ? product.agency_id : "UNKNOWN",
      // agencyInternal: r.agency,
      stateInternal: sureOfState ? (State[stusab as any] as any) : null,
      company: Company.ICS,
      createdAt: new Date(r.createdAt).toISOString(),
      canonicalFacilityId: null,
      internalNotes: `Listed agency: ${r.agency}`,
      externalNotes: null,
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

    const valid = facilities.filter((n) => n.productInternal !== "UNKNOWN");

    return valid;
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
          updatedAt: [new Date(r.createdAt).toISOString()],
          companyFacilityId: cf.id,
          internalNotes: `Listed agency: ${r.agency}`,
          externalNotes: null,
        };

        tf.push(partial);
      }
    }

    return tf;
  }
}

export default ICS;
