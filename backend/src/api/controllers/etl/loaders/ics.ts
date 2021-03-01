import { ScrapeResult, ICSRate } from "@ptdp/lib";
import ETL from "./abstract";
import { IFacility, IRate } from "../../../../types/index";
import * as db from "../../../csv_db";

class ICS extends ETL {
  constructor(result: ScrapeResult<ICSRate>) {
    super(result);
  }

  // Arizona - Arizona Department of Corrections => Arizona Department of Corrections
  trimAgency(agency: string) {
    return agency.split("-")[1].trim();
  }

  transformFacilities(result: ScrapeResult<ICSRate>): IFacility[] {
    const facilities: Record<string, IFacility> = {};

    Object.entries(result).forEach(([stusab, rates]) => {
      (rates as ICSRate[]).forEach((r: ICSRate): void => {
        const sha = this.facilitySha(r.facility, stusab);

        if ((facilities as any)[sha]) return;

        facilities[sha] = {
          id: sha,
          name: r.facility,
          jurisdiction: undefined,
          agency: this.trimAgency(r.agency),
          createdAt: new Date(r.createdAt).toISOString(),
          populationFeb20: undefined,
          residentsPopulation: undefined,
          state: stusab,
          address: undefined,
          zipcode: undefined,
          city: undefined,
          county: undefined,
          latitude: undefined,
          countyFIPS: undefined,
          HIFLID: undefined,
          rawName: r.facility,
        };
      });
    });

    return Object.values(facilities);
  }

  async transformRates(result: ScrapeResult<ICSRate>): Promise<IRate[]> {
    const tf: IRate[] = [];

    const facilities = await db.Facility.query();

    Object.entries(result).forEach(([stusab, rates]) => {
      (rates as ICSRate[]).forEach((r: ICSRate): void => {
        const fSha = this.facilitySha(r.facility, stusab);
        const rSha = this.rateSha(r);

        if (!facilities.find((f) => f.id === fSha)) {
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
          amountInitial: r.initialCost ? r.initialCost * 100 : undefined,
          amountAdditional: r.overCost ? r.overCost * 100 : undefined,
          amountTax: r.tax
            ? parseFloat(((r.tax / (r.seconds / 60)) as any).toFixed(2))
            : undefined,
          phone: r.number,
          inState: this.isInState(r, stusab),
          facility: fSha,
          service: "Default Phone",
          updatedAt: JSON.stringify([new Date(r.createdAt).toISOString()]),
        });
      });
    });
    return tf;
  }
}

export default ICS;
