import { ScrapeResult, ICSRate } from "@ptdp/lib";
import ETL from "./abstract";
import { ICompanyFacility, IRate, Service } from "../../../../types/index";
import * as db from "../../../csv_db";

class ICS extends ETL {
  constructor(result: ScrapeResult<ICSRate>) {
    super(result);
  }

  // Arizona - Arizona Department of Corrections => Arizona Department of Corrections
  trimAgency(agency: string) {
    return agency.split("-")[1].trim();
  }

  transformContracts(result: ScrapeResult<ICSRate>): ICompanyFacility[] {
    const contracts: Record<string, ICompanyFacility> = {};

    Object.entries(result).forEach(([stusab, rates]) => {
      (rates as ICSRate[]).forEach((r: ICSRate): void => {
        const sha = this.contractSha(r.facility, r.agency, "ICS", stusab);

        if ((contracts as any)[sha]) return;

        contracts[sha] = {
          id: sha,
          facilityInternal: r.facility,
          agencyInternal: this.trimAgency(r.agency),
          stateInternal: stusab,
          createdAt: new Date(r.createdAt).toISOString(),
          company: "ICS",
          canonicalFacility: undefined,
        };
      });
    });

    return Object.values(contracts);
  }

  async transformRates(result: ScrapeResult<ICSRate>): Promise<IRate[]> {
    const tf: IRate[] = [];

    const contracts = await db.Contract.query();

    Object.entries(result).forEach(([stusab, rates]) => {
      (rates as ICSRate[]).forEach((r: ICSRate): void => {
        const cSha = this.contractSha(r.facility, r.agency, "ICS", stusab);

        const rSha = this.rateSha(r);

        if (!contracts.find((f) => f.id === cSha)) {
          throw new Error("Could not find facility for " + JSON.stringify(r));
        }

        tf.push({
          id: rSha,
          durationInitial: r.initialDuration
            ? this.strToInt(r.initialDuration) * 60
            : undefined,
          durationAdditional: r.overDuration
            ? this.strToInt(r.overDuration) * 60
            : undefined,
          amountInitial: r.initialCost
            ? parseFloat(r.initialCost.toFixed(2))
            : undefined,
          amountAdditional: r.overCost
            ? parseFloat(r.overCost.toFixed(2))
            : undefined,
          pctTax: r.tax
            ? parseFloat(((r.tax / (r.seconds / 60)) as any).toFixed(2))
            : undefined,
          phone: r.number,
          inState: this.isInState(r, stusab) ? 1 : 0,
          companyFacility: cSha,
          service: Service.Default,
          updatedAt: JSON.stringify([new Date(r.createdAt).toISOString()]),
        });
      });
    });
    return tf;
  }
}

export default ICS;
