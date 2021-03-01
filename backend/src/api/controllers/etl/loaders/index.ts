import {
  ScrapeResult,
  ICSRate,
  // SecurusRate,
  // Rate as RateData,
  // Stusab,
  // Facility as FacilityData,
} from "@ptdp/lib";
// import { rawToSha, removeMetadata } from "./util";
import ICS from "./ics";

// import Rate from "../../../models/rate";
// import CanonicalRate from "../../../models/canonical_rate";
// import Service from "../../../models/service";
// import Company from "../../../models/company";
// import Scraper from "../../../models/scraper";
// import Facility from "../../../models/facility";
// import Agency from "../../../models/agency";
// import State from "../../../models/state";

// const strToInt = (str: string): number =>
//   parseInt(str.match(new RegExp(/\d+/))?.[0] || "0");

// const createFacility = async (
//   facility_name: string,
//   stusab: string,
//   agency_name?: string
// ) => {
//   const state = await State.query().findOne("stusab", "=", stusab);

//   let agency = null;
//   if (agency_name) {
//     let agency = await Agency.query()
//       .findOne("raw_name", "=", agency_name)
//       .select("id");

//     if (!agency) {
//       agency = await createAgency(agency_name);
//     }
//   }

//   const insert: Partial<FacilityData> = {
//     raw_name: facility_name,
//     name: facility_name,
//     state_id: state.id,
//   };

//   if (agency !== null) insert.agency_id = (agency as Agency).id;

//   const facility = await Facility.query().insert(insert);
//   return facility;
// };

// const createAgency = async (agency_name: string) => {
//   const agency = await Agency.query().insert({
//     raw_name: agency_name,
//     name: trimAgency(agency_name),
//   });
//   return agency;
// };

export const ics = async (data: ScrapeResult<ICSRate>) => {
  console.log(ICS);
  const icsETL = new ICS(data);
  await icsETL.run();
};

// export const securus = async (scrape_result: ScrapeResult<SecurusRate>) => {
//   const errors = [];

//   const company = await Company.query()
//     .findOne("name", "=", "Securus")
//     .select("id");

//   let count = 0;
//   let total = Object.keys(scrape_result).reduce((acc, elt) => {
//     return acc + (scrape_result as any)[elt].length || 0;
//   }, 0);

//   for (const property in scrape_result) {
//     if (property === "errors") continue;
//     const state = scrape_result[property as Stusab];

//     for (const rate of state!) {
//       console.log(`Processing ${count}/${total}\n`);
//       count += 1;

//       const sha = rawToSha(rate);
//       const match = await Rate.query()
//         .findOne("raw_sha1", "=", sha)
//         .select("id", "seen_at");

//       if (match) {
//         try {
//           const rateIso = new Date(rate.createdAt).toISOString();
//           if (match.seen_at.includes(rateIso)) {
//             console.warn(
//               `Exact duplicate found : ${sha} matches SHA for ${match.id} \n`
//             );
//             errors.push(`Duplicate: SHA: ${sha} matches SHA for ${match.id}`);
//           } else {
//             console.warn(
//               `Duplicate data found ${rate.facility} updating seen_at: ${sha} matches SHA for ${match.id} \n`
//             );
//             errors.push(
//               `Duplicate data found ${rate.facility} updating seen_at: ${sha} matches SHA for ${match.id} \n`
//             );
//             await match.$query().patch({
//               seen_at: [
//                 ...match.seen_at,
//                 new Date(rate.createdAt).toISOString(),
//               ],
//             });
//           }
//           continue;
//         } catch (err) {
//           errors.push(err.toString());
//           console.error(err.toString());
//         }
//       }

//       const insertable = await securusTransform(rate, {
//         sha,
//         company_id: company.id,
//         state: property,
//       });

//       await Rate.query().insert(insertable);
//     }
//   }

//   // upload errors to GCS
//   console.log(errors);
// };
