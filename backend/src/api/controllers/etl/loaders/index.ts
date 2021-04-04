import { ScrapeResult, ICSRate, SecurusRate, GTLRate } from "@ptdp/lib";
import ICS from "./ics";
import Securus from "./securus";
import GTL from "./gtl";
import Canonical from "./canonical";

export const ics = async (data: ScrapeResult<ICSRate>) => {
  const icsETL = new ICS(data);
  await icsETL.run();
};

export const securus = async (data: ScrapeResult<SecurusRate>) => {
  const securusETL = new Securus(data);
  await securusETL.run();
};

export const gtl = async (data: ScrapeResult<GTLRate>) => {
  const gtlETL = new GTL(data);
  await gtlETL.run();
};

export const canonical = async () => {
  const canonicalETL = new Canonical();
  await canonicalETL.run();
};
