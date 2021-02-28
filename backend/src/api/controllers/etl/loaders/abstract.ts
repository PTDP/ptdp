import {
  ScrapeResult,
  ICSRate,
  SecurusRate,
  Rate as RateData,
  //   Stusab,
  //   Facility as FacilityData,
} from "@ptdp/lib";
import { sha256 } from "./util";

export const removeMetadata = (
  raw: ICSRate | SecurusRate
): Omit<ICSRate | SecurusRate, "createdAt"> => {
  const r: ICSRate | SecurusRate = { ...raw };
  delete (r as any).createdAt;
  return r;
};

export default abstract class ETL {
  constructor(private result: ScrapeResult<ICSRate | SecurusRate>) {}

  async run(): Promise<void> {
    try {
      const transformed = await this.transform(this.result);
      await this.load(transformed);
    } catch (err) {
      console.error(err.toString());
    }
  }

  rawToSha(raw: ICSRate | SecurusRate) {
    return sha256(JSON.stringify(removeMetadata(raw)));
  }

  abstract transform(
    result: ScrapeResult<ICSRate | SecurusRate>
  ): Promise<RateData>;

  abstract load(transformed: RateData): void;
}
