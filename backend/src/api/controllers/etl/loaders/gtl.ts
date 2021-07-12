import { ScrapeResult, GTLRate } from "@ptdp/lib";
import ETL from "./abstract";
import {
  ICompanyFacility,
  IRate,
  Service,
  State,
  Company,
} from "../../../../types/index";
import * as db from "../../../../db/models";

class GTL extends ETL {
  constructor(result: ScrapeResult<GTLRate>) {
    super(result);
  }

  rateToCF(r: GTLRate, stusab: string) {
    const isSubFacility = r.subFacility !== null;

    return {
      facilityInternal: (isSubFacility ? r.subFacility : r.facility) || "",
      stateInternal: State[stusab as any] as any,
      company: Company.GTL,
      agencyInternal: isSubFacility ? r.facility : null,
      agencyFullNameInternal: null,
      created: new Date(r.createdAt).toISOString(),
      canonicalFacilityId: null,
      notes: [],
      hidden_override: false,
    };
  }

  transformCompanyFacilities(
    result: ScrapeResult<GTLRate>
  ): ICompanyFacility[] {
    const facilities: ICompanyFacility[] = [];

    Object.entries(result).forEach(([stusab, rates]) => {
      (rates as GTLRate[]).forEach((r: GTLRate): void => {
        facilities.push(this.rateToCF(r, stusab));
      });
    });

    return facilities;
  }

  async transformRates(result: ScrapeResult<GTLRate>): Promise<IRate[]> {
    const tf: IRate[] = [];
    const entries = Object.entries(result);

    const companyFacilities = await db.CompanyFacility.query();

    const getService = (service: string) => {
      if (!service) return null;
      else if (service === "Collect") {
        return Service["GTL Collect"];
      } else if (service === "AdvancePay") {
        return Service["GTL AdvancePay"];
      }
      return null;
    };

    for (let j = 0; j < entries.length; j++) {
      let [stusab, rates] = entries[j] as [string, GTLRate[]];
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
          durationInitial: 0,
          durationAdditional: r.durationAdditional,
          amountInitial: 0,
          amountAdditional: r.amountAdditional
            ? parseFloat(r.amountAdditional.toFixed(2))
            : null,
          pctTax: 0,
          phone: r.phone!,
          inState: this.isInState({ ...r, number: r.phone }, stusab),
          company: Company.GTL,
          source: r.source,
          service: getService(r.service) as Service,
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

export default GTL;
