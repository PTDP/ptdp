// import {
//   ScrapeResult,
//   ICSRate,
//   SecurusRate,
//   Rate as RateData,
//   Stusab,
//   Facility as FacilityData,
// } from "@ptdp/lib";
// import ETL from "./abstract";
// import * as db from "../csv_db";

// export class ICS extends ETL {
//   constructor(result: ScrapeResult<ICSRate>) {
//     super(result);
//   }

//   async transformFacilities(result: ScrapeResult<ICSRate>): Promise<RateData> {
//     // if there is an agency field, trim it
//     //
//   }

//   async loadFacilities(transformed: RateData): Promise<void> {
//     // fetch facilities resource, parse it into something useful
//     // if there is a sha1 in our remote facilities resource corresponding to raw facility name,
//     // do nothing
//     // else
//     // push facility into resource, with uid, everything else we can fetch from rate
//     // write facilities resource
//     const existing = await db.Facility.query();
//   }

//   async transform(result: ScrapeResult<ICSRate>): Promise<RateData> {
//     const errors = [];

//     let count = 0;
//     let total = Object.keys(result).reduce((acc, elt) => {
//       return acc + (result as any)[elt].length || 0;
//     }, 0);

//     Object.entries(result).forEach(([state, v], i) => {
//       // if not facility, create it so that we can reference it
//       //
//     });
//   }

//   load(transformed: RateData): void {
//     //
//   }
// }
