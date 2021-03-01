import { ScrapeResult, SecurusRate } from "@ptdp/lib";
import ETL from "./abstract";
import { IContract, IRate, Service } from "../../../../types/index";
import * as db from "../../../csv_db";

class Securus extends ETL {
  constructor(result: ScrapeResult<SecurusRate>) {
    super(result);
  }

  // Arizona - Arizona Department of Corrections => Arizona Department of Corrections
  trimAgency(agency: string) {
    return agency.split("-")[1].trim();
  }

  transformContracts(result: ScrapeResult<SecurusRate>): IContract[] {
    const contracts: Record<string, IContract> = {};

    Object.entries(result).forEach(([stusab, rates]) => {
      (rates as SecurusRate[]).forEach((r: SecurusRate): void => {
        const sha = this.contractSha(r.facility, "", "Securus", stusab);

        if ((contracts as any)[sha]) return;

        contracts[sha] = {
          id: sha,
          facilityInternal: r.facility,
          agencyInternal: "",
          stateInternal: stusab,
          createdAt: new Date(r.createdAt).toISOString(),
          company: "Securus",
          canonicalFacility: undefined,
        };
      });
    });

    return Object.values(contracts);
  }

  async transformRates(result: ScrapeResult<SecurusRate>): Promise<IRate[]> {
    const tf: IRate[] = [];

    const facilities = await db.Contract.query();

    Object.entries(result).forEach(([stusab, rates]) => {
      (rates as SecurusRate[]).forEach((r: SecurusRate): void => {
        const fSha = this.contractSha(r.facility, "", "Securus", stusab);
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
          contract: fSha,
          service: Service[r.service],
          updatedAt: JSON.stringify([new Date(r.createdAt).toISOString()]),
        });
      });
    });
    return tf;
  }
}

export default Securus;
