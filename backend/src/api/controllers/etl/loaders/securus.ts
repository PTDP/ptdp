import { ScrapeResult, SecurusRate } from "@ptdp/lib";
import ETL from "./abstract";
import { IFacility, IRate, Service } from "../../../../types/index";
import * as db from "../../../csv_db";

class Securus extends ETL {
  constructor(result: ScrapeResult<SecurusRate>) {
    super(result);
  }

  // Arizona - Arizona Department of Corrections => Arizona Department of Corrections
  trimAgency(agency: string) {
    return agency.split("-")[1].trim();
  }

  transformFacilities(result: ScrapeResult<SecurusRate>): IFacility[] {
    const facilities: Record<string, IFacility> = {};

    Object.entries(result).forEach(([stusab, rates]) => {
      (rates as SecurusRate[]).forEach((r: SecurusRate): void => {
        const sha = this.facilitySha(r.facility, stusab);

        if ((facilities as any)[sha]) return;

        facilities[sha] = {
          id: sha,
          name: r.facility,
          jurisdiction: undefined,
          agency: undefined,
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

  async transformRates(result: ScrapeResult<SecurusRate>): Promise<IRate[]> {
    const tf: IRate[] = [];

    const facilities = await db.Facility.query();

    Object.entries(result).forEach(([stusab, rates]) => {
      (rates as SecurusRate[]).forEach((r: SecurusRate): void => {
        const fSha = this.facilitySha(r.facility, stusab);
        const rSha = this.rateSha(r);

        if (!facilities.find((f) => f.id === fSha)) {
          throw new Error("Could not find facility for " + JSON.stringify(r));
        }

        tf.push({
          id: rSha,
          durationInitial: r.seconds,
          durationAdditional: r.seconds,
          amountInitial: r.initalAmount
            ? parseFloat(parseFloat(r.initalAmount.replace("$", "")).toFixed(2))
            : undefined,
          amountAdditional: r.additionalAmount
            ? parseFloat(
                parseFloat(r.additionalAmount.replace("$", "")).toFixed(2)
              )
            : undefined,
          amountTax: 0,
          phone: r.number!,
          inState: this.isInState(r, stusab) ? 1 : 0,
          facility: fSha,
          service: Service[r.service],
          updatedAt: JSON.stringify([new Date(r.createdAt).toISOString()]),
        });
      });
    });
    return tf;
  }
}

export default Securus;
