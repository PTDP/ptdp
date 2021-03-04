import { ICompanyFacility, State } from "../../../types";
import { Exporter } from "../etl/git";
var states = require("us-state-codes");
import * as functions from "firebase-functions";
import axios from "axios";
import * as csv from "fast-csv";
// import querystring from "querystring";
import fs from "fs";

// import fs from "fs";

const PLACES_KEY = functions.config().google.places;

export class GeocodedCompanyFExporter extends Exporter<
  GeocodedCompanyF,
  SerialGeocodedCompanyF
> {
  PATH = "intermediate_data/intermediate_company_f.md";
  CLOUD_STORAGE_PATH = `exports/intermediate_company_f${Date.now()}.csv`;

  transform(fs: GeocodedCompanyF[]) {
    return fs.map((r) => ({
      ...r,
      state: State[r.stateInternal],
    }));
  }
}

const CSV =
  "https://storage.googleapis.com/ptdp-staging.appspot.com/exports/company_facilities_1614735201106.csv";

interface GeocodedCompanyF extends ICompanyFacility {
  normalized_name: null;
  address: string | null;
  googlePlaceName: string | null;
  longitude: number | null;
  latitude: number | null;
  county: string | null;
  googlePlaceId: string;
  state: State;
  //   countyFIPS: number | null;
  //   HIFLDID: null;
  //   UCLACovid19ID: null;
}

interface SerialGeocodedCompanyF extends Omit<GeocodedCompanyF, "state"> {
  state: any;
}

const readCSV = (url: string): Promise<ICompanyFacility[]> => {
  return new Promise(async (res, fail) => {
    const cs = (await axios.get(url)).data;
    const out: ICompanyFacility[] = [];
    const stream = csv.parse({ headers: true });
    stream.on("error", (error) => {
      console.error(error);
      fail(error);
    });
    stream.on("data", (row) => {
      //   console.log(row);
      out.push(row);
    });
    stream.on("end", (rowCount: number) => {
      console.log("reached end");
      res(out);
    });
    stream.write(cs);
    stream.end();
  });
};

// const serialize = (data: any, path: string) => {
//   return new Promise((res, rej) => {
//     const csvStream = csv.format({ headers: true });
//     csvStream.on("end", () => res("cs"));
//     csvStream.on("error", (err) => rej(err));
//     csvStream.on("data", (d) => {
//       fs.writeFileSync("./intermediate_company_facilities.csv", d);
//     });
//     csvStream.end();
//   });
// };

export const geocode_company = async () => {
  const cs = await readCSV(CSV);
  //   lat, lng, name, place_id

  fs.appendFileSync(
    "./intermediate_company_facilities.csv",
    `id,facilityInternal,agencyInternal,stateInternal,company,createdAt,googlePlaceName,address,longitude,latitude,county,googlePlaceId,state\n`
  );

  for (let i = 0; i < cs.length; i++) {
    try {
      console.log(i + " / " + cs.length);
      const e = cs[i];
      let formatted_address = "";
      let lat = "";
      let lng = "";
      let place_id = "";
      let name = "";

      try {
        ({ formatted_address, lat, lng, name, place_id } =
          (await geocodeFacility(cs[i])) || {});
      } catch (err) {
        console.error(err);
      }

      let county = "";
      try {
        county = await reverseGeocodeFacilityGoogle(lat, lng);
      } catch (err) {
        console.error(err);
      }

      fs.appendFileSync(
        "./intermediate_company_facilities.csv",
        `${(e as any).id},"${e.facilityInternal}","${e.agencyInternal}","${
          e.stateInternal
        }","${e.company}","${
          e.createdAt
        }","${name}","${formatted_address}","${lng}","${lat}","${county}","${place_id}","${
          e.stateInternal
        }"\n`
      );
    } catch (err) {
      console.error(err);
    }
  }
  /*
    normalized_name: null;
    address: string | null;
    googlePlaceName: string | null;
    longitude: number | null;
    latitude: number | null;
    state: State;
    county: string | null;
    countyFIPS: number | null;
    HIFLDID: null;
    UCLACovid19ID: null;
  */

  //   await reverseGeocodeFacilityCensus(formatted_address);

  /*
  normalized_name: null;
  address: string | null;
  googlePlaceName: string | null;
  longitude: number | null;
  latitude: number | null;
  state: State;
  county: string | null;
  countyFIPS: number | null;
  HIFLDID: null;
  UCLACovid19ID: null;
  */
};

const geocodeFacility = async (facility: ICompanyFacility) => {
  const query = `${facility.facilityInternal
    .split(" ")
    .join("+")}+in+${states
    .getStateNameByStateCode(facility.stateInternal)
    .split(" ")
    .join("+")}`;
  const { results } = (
    await axios.get(
      `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${query}&key=${PLACES_KEY}`
    )
  ).data;
  if (results.length) {
    const {
      formatted_address,
      geometry: {
        location: { lat, lng },
      },
      name,
      place_id,
    } = results[0];

    return {
      formatted_address,
      lat,
      lng,
      name,
      place_id,
    };
  }
  return {};
};

const reverseGeocodeFacilityGoogle = async (lat: string, lng: string) => {
  const query = `latlng=${lat},${lng}`;
  const { results } = (
    await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?${query}&key=${PLACES_KEY}`
    )
  ).data;
  const { address_components } = results[0];

  const county = address_components.find(
    (c: any) =>
      c.types.includes("administrative_area_level_2") &&
      c.types.includes("political")
  );

  if (!county) {
    console.log("COULD NOT FIND ADMIN_LEVEL_2 ");
    return;
  }
  //   console.log(county);
  return county.long_name || county.short_name;
};

// const readCSVS = (url: string): Promise<ICompanyFacility[]> => {
//   return new Promise(async (res, fail) => {
//     const cs = fs.readFileSync(url);
//     const out: ICompanyFacility[] = [];
//     const stream = csv.parse({ headers: true });
//     stream.on("error", (error) => {
//       console.error(error);
//       fail(error);
//     });
//     stream.on("data", (row) => {
//       //   console.log(row);
//       out.push(row);
//     });
//     stream.on("end", (rowCount: number) => {
//       console.log("reached end");
//       res(out);
//     });
//     stream.write(cs);
//     stream.end();
//   });
// };

export const intCompare = async () => {
  const all = await readCSV(CSV);
  const term = await readCSV(
    "https://firebasestorage.googleapis.com/v0/b/ptdp-staging.appspot.com/o/intermediate_company_facilities.csv?alt=media&token=d9b556e9-5768-47ef-9a2c-93c73bbca78f"
  );

  const missing = all.filter((a) => {
    !term.find((t) => t.facilityInternal === a.facilityInternal);
  });

  console.log(missing.length);
};
