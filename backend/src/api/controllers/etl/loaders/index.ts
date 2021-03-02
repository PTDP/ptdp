import { ScrapeResult, ICSRate } from "@ptdp/lib";
import ICS from "./ics";
// import Securus from "./securus";

export const ics = async (data: ScrapeResult<ICSRate>) => {
  const icsETL = new ICS(data);
  await icsETL.run();
};

// export const securus = async (data: ScrapeResult<SecurusRate>) => {
//   const securusETL = new Securus(data);
//   await securusETL.run();
// };
