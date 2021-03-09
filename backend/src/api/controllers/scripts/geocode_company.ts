import { ICompanyFacility, State } from "../../../types";
import { Exporter } from "../etl/git";
var states = require("us-state-codes");
import * as functions from "firebase-functions";
import axios from "axios";
import * as csv from "fast-csv";
// import querystring from "querystring";
import * as fs from "fs";

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
      state: r.stateInternal ? State[r.stateInternal] : null,
    }));
  }
}

const CSV =
  "https://storage.googleapis.com/ptdp-staging.appspot.com/exports/company_facilities_1615248404962.csv";

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

const serialize = (data: any, path: string) => {
  return new Promise((res, rej) => {
    let cs = "";
    const csvStream = csv.format({ headers: true });
    csvStream.on("end", () => {
      fs.writeFileSync(path, cs);
      res(true);
    });
    csvStream.on("error", (err) => rej(err));
    csvStream.on("data", (d) => {
      cs += d;
    });
    data.forEach((elt: any) => csvStream.write(elt));
    csvStream.end();
  });
};

// One off script (3/7/2021) to merge geocoded elts (already paid for) w/ newly scraped elements
export const merge_geocodings = async () => {
  const latest_company_facilities = await readCSV(
    "https://storage.googleapis.com/ptdp-staging.appspot.com/exports/company_facilities_1615248404962.csv"
  );

  const previously_geocoded = await readCSV(
    "https://raw.githubusercontent.com/PTDP/data/main/intermediate_data/geocoded_company_facilities.csv"
  );

  let missing: any[] = [];
  const geocoded = latest_company_facilities.map((e) => {
    const prev: any = previously_geocoded.find((elt) => {
      return (
        elt.company === e.company &&
        elt.facilityInternal === e.facilityInternal &&
        // elt.agencyInternal === e.agencyInternal &&
        elt.stateInternal === e.stateInternal
      );
    });

    if (!prev) {
      missing.push(e);
      return;
    }

    return {
      ...e,
      googlePlaceName: prev.googlePlaceName,
      address: prev.address,
      longitude: prev.longitude,
      latitude: prev.latitude,
      county: prev.county,
      googlePlaceId: prev.googlePlaceId,
      state: prev.state,
    };
  });

  const fixed = missing.map((elt) => {
    let updated = { ...elt };
    if (elt.facilityInternal === "Benton County Jail") {
      updated = {
        ...updated,
        googlePlaceName: "Benton County Jail",
        address: "190 NW 4th St. Corvallis, OR 97330",
        longitude: -123.2645137,
        latitude: 44.5656091,
        county: "Benton County",
        googlePlaceId: null,
        state: "OR",
      };
    } else if (elt.facilityInternal === "Sumter County Detention Center") {
      updated = {
        ...updated,
        googlePlaceName: "Sumter-Lee Regional Detention Center",
        address: "1250 Winkles Rd, Sumter, SC 29153, United States",
        longitude: -80.3261587,
        latitude: 33.9589824,
        county: "Sumter County",
        googlePlaceId: "ChIJvx7PsXll_4gRP_eD9aq3HC4",
        state: "SC",
      };
    } else if (
      elt.facilityInternal ===
      'OK DOC - CHARLES E "BILL" JOHNSON CORRECTIONAL CENTER'
    ) {
      const et: any = previously_geocoded.find((geo_elt: any) => {
        return geo_elt.googlePlaceId === "ChIJYeQI-QVwr4cRuRsTLE4xCS4";
      });

      updated = {
        ...updated,
        googlePlaceName: et!.googlePlaceName,
        address: et!.address,
        longitude: et!.longitude,
        latitude: et!.latitude,
        county: et!.county,
        googlePlaceId: et!.googlePlaceId,
        state: et!.state,
      };
    }
    return updated;
  });

  geocoded.push(...fixed);
  geocoded.sort((a: any, b: any) => a.id - b.id);

  await serialize(geocoded, "./geocoded.csv");
};

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
        // if company is ICS, we cannot trust the reported state for each facility
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
          e.created
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

  console.log(results);
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
