import {
  ScrapeResult,
  ICSRate,
  SecurusRate,
  Rate as RateData,
  Stusab,
  Facility as FacilityData,
} from "@ptdp/lib";
import { rawToSha, removeMetadata } from "./util";

import Rate from "../../../models/rate";
import CanonicalRate from "../../../models/canonical_rate";
import Service from "../../../models/service";
import Company from "../../../models/company";
import Scraper from "../../../models/scraper";
import Facility from "../../../models/facility";
import Agency from "../../../models/agency";
import State from "../../../models/state";

const strToInt = (str: string): number =>
  parseInt(str.match(new RegExp(/\d+/))?.[0] || "0");

// Arizona - Arizona Department of Corrections => Arizona Department of Corrections
const trimAgency = (agency: string) => agency.split("-")[1].trim();

const createFacility = async (
  facility_name: string,
  stusab: string,
  agency_name?: string
) => {
  const state = await State.query().findOne("stusab", "=", stusab);

  let agency = null;
  if (agency_name) {
    let agency = await Agency.query()
      .findOne("raw_name", "=", agency_name)
      .select("id");

    if (!agency) {
      agency = await createAgency(agency_name);
    }
  }

  const insert: Partial<FacilityData> = {
    raw_name: facility_name,
    name: facility_name,
    state_id: state.id,
  };

  if (agency !== null) insert.agency_id = (agency as Agency).id;

  const facility = await Facility.query().insert(insert);
  return facility;
};

const createAgency = async (agency_name: string) => {
  const agency = await Agency.query().insert({
    raw_name: agency_name,
    name: trimAgency(agency_name),
  });
  return agency;
};

const icsTransform = async (
  rate: ICSRate,
  {
    sha,
    service_id,
    company_id,
    state,
  }: {
    sha: string;
    service_id: number;
    company_id: number;
    state: string;
  }
): Promise<RateData> => {
  let facility = await Facility.query()
    .findOne("raw_name", "=", rate.facility)
    .select("id");

  if (!facility)
    facility = await createFacility(rate.facility, rate.agency, state);

  let canonical_rate = (
    await CanonicalRate.query()
      .select("id")
      .where("facility_id", "=", facility.id)
      .where("company_id", "=", company_id)
      .where("service_id", "=", service_id)
      .where("phone_number", "=", `${rate.number}`)
  ).find(Boolean);

  if (!canonical_rate) {
    canonical_rate = await CanonicalRate.query().insert({
      facility_id: facility.id,
      company_id,
      service_id,
      phone_number: `${rate.number}`,
    });
  }

  const scraper = await Scraper.query()
    .findOne("uuid", "=", rate.scraper)
    .select("id");
  const tax_rate = rate.tax
    ? parseFloat(((rate.tax / (rate.seconds / 60)) as any).toFixed(2))
    : null;

  return {
    initial_amount: rate.initialCost ? rate.initialCost * 100 : null,
    additional_amount: rate.overCost ? rate.overCost * 100 : null,
    initial_duration: rate.initialDuration
      ? strToInt(rate.initialDuration) * 60
      : null,
    over_duration: rate.overDuration ? strToInt(rate.overDuration) * 60 : null,
    // get 60 second tax rate
    tax: rate.tax ? tax_rate : null,
    raw_sha1: sha,
    phone_number: rate.number,
    seen_at: [new Date(rate.createdAt).toISOString()],
    scraper_id: scraper.id,
    raw: JSON.stringify(removeMetadata(rate)),
    canonical_rate_id: canonical_rate.id,
  };
};

export const ics = async (scrape_result: ScrapeResult<ICSRate>) => {
  const errors = [];

  const service = await Service.query()
    .findOne("name", "=", "Default")
    .select("id");
  const company = await Company.query()
    .findOne("name", "=", "ICS")
    .select("id");

  let count = 0;
  let total = Object.keys(scrape_result).reduce((acc, elt) => {
    return acc + (scrape_result as any)[elt].length || 0;
  }, 0);

  for (const property in scrape_result) {
    if (property === "errors") continue;
    const state = scrape_result[property as Stusab];

    for (const rate of state!) {
      console.log(`Processing ${count}/${total}\n`);
      count += 1;

      const sha = rawToSha(rate);
      const match = await Rate.query()
        .findOne("raw_sha1", "=", sha)
        .select("id", "seen_at");

      if (match) {
        try {
          const rateIso = new Date(rate.createdAt).toISOString();
          if (match.seen_at.includes(rateIso)) {
            console.warn(
              `Exact duplicate found : ${sha} matches SHA for ${match.id} \n`
            );
            errors.push(`Duplicate: SHA: ${sha} matches SHA for ${match.id}`);
          } else {
            console.warn(
              `Duplicate data found ${rate.facility} updating seen_at: ${sha} matches SHA for ${match.id} \n`
            );
            errors.push(
              `Duplicate data found ${rate.facility} updating seen_at: ${sha} matches SHA for ${match.id} \n`
            );
            await match.$query().patch({
              seen_at: [
                ...match.seen_at,
                new Date(rate.createdAt).toISOString(),
              ],
            });
          }
          continue;
        } catch (err) {
          errors.push(err.toString());
          console.error(err.toString());
        }
      }

      const insertable = await icsTransform(rate, {
        sha,
        service_id: service.id,
        company_id: company.id,
        state: property,
      });

      await Rate.query().insert(insertable);
    }
  }

  // upload errors to GCS
  console.log(errors);
};

const securusTransform = async (
  rate: SecurusRate,
  {
    sha,
    company_id,
    state,
  }: {
    sha: string;
    company_id: number;
    state: string;
  }
): Promise<RateData> => {
  let facility = await Facility.query()
    .findOne("raw_name", "=", rate.facility)
    .select("id");

  let service = await Service.query().findOne("name", "=", rate.service);

  if (!facility) facility = await createFacility(rate.facility, state);

  let canonical_rate = (
    await CanonicalRate.query()
      .select("id")
      .where("facility_id", "=", facility.id)
      .where("company_id", "=", company_id)
      .where("service_id", "=", service.id)
      .where("phone_number", "=", `${rate.number}`)
  ).find(Boolean);

  if (!canonical_rate) {
    canonical_rate = await CanonicalRate.query().insert({
      facility_id: facility.id,
      company_id,
      service_id: service.id,
      phone_number: `${rate.number}`,
    });
  }

  const scraper = await Scraper.query()
    .findOne("uuid", "=", rate.scraper)
    .select("id");

  const tax_rate = 0;

  return {
    initial_amount: rate.initalAmount
      ? parseFloat(rate.initalAmount.replace("$", "")) * 100
      : null,
    additional_amount: rate.additionalAmount
      ? parseFloat(rate.additionalAmount.replace("$", "")) * 100
      : null,
    initial_duration: rate.seconds, //60
    over_duration: rate.seconds, // 60
    // get 60 second tax rate
    tax: tax_rate,
    raw_sha1: sha,
    phone_number: rate.number!,
    seen_at: [new Date(rate.createdAt).toISOString()],
    scraper_id: scraper.id,
    raw: JSON.stringify(removeMetadata(rate)),
    canonical_rate_id: canonical_rate.id,
  };
};

export const securus = async (scrape_result: ScrapeResult<SecurusRate>) => {
  const errors = [];

  const company = await Company.query()
    .findOne("name", "=", "Securus")
    .select("id");

  let count = 0;
  let total = Object.keys(scrape_result).reduce((acc, elt) => {
    return acc + (scrape_result as any)[elt].length || 0;
  }, 0);

  for (const property in scrape_result) {
    if (property === "errors") continue;
    const state = scrape_result[property as Stusab];

    for (const rate of state!) {
      console.log(`Processing ${count}/${total}\n`);
      count += 1;

      const sha = rawToSha(rate);
      const match = await Rate.query()
        .findOne("raw_sha1", "=", sha)
        .select("id", "seen_at");

      if (match) {
        try {
          const rateIso = new Date(rate.createdAt).toISOString();
          if (match.seen_at.includes(rateIso)) {
            console.warn(
              `Exact duplicate found : ${sha} matches SHA for ${match.id} \n`
            );
            errors.push(`Duplicate: SHA: ${sha} matches SHA for ${match.id}`);
          } else {
            console.warn(
              `Duplicate data found ${rate.facility} updating seen_at: ${sha} matches SHA for ${match.id} \n`
            );
            errors.push(
              `Duplicate data found ${rate.facility} updating seen_at: ${sha} matches SHA for ${match.id} \n`
            );
            await match.$query().patch({
              seen_at: [
                ...match.seen_at,
                new Date(rate.createdAt).toISOString(),
              ],
            });
          }
          continue;
        } catch (err) {
          errors.push(err.toString());
          console.error(err.toString());
        }
      }

      const insertable = await securusTransform(rate, {
        sha,
        company_id: company.id,
        state: property,
      });

      await Rate.query().insert(insertable);
    }
  }

  // upload errors to GCS
  console.log(errors);
};
