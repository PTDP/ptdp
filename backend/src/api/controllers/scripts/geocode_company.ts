import { ICompanyFacility, State } from "../../../types";
import { Exporter } from "../etl/git";
var states = require("us-state-codes");
import * as functions from "firebase-functions";
import axios from "axios";
import * as csv from "fast-csv";
// import querystring from "querystring";
import * as turf from "@turf/turf";
import * as fs from "fs";

// import fs from "fs";

const PLACES_KEY = functions.config().google.places;

export class GeocodedCompanyFExporter extends Exporter<
  GeocodedCompanyF,
  SerialGeocodedCompanyF
> {
  PATH = "intermediate_data/intermediate_company_f.md";
  CLOUD_STORAGE_PATH = `exports/intermediate_company_f${Date.now()}.csv`;

  async transform(fs: GeocodedCompanyF[]) {
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
// Made some edits during GTL ingestion (4/4/2021)
// export const merge_geocodings = async () => {
//   const latest_company_facilities = await readCSV(
//     "https://storage.googleapis.com/ptdp-staging.appspot.com/exports/company_facilities_1617551298692.csv"
//   );

// const previously_geocoded = await readCSV(
//   "https://raw.githubusercontent.com/PTDP/data/main/intermediate_data/geocoded_company_facilities.csv"
// );

//   let missing: any[] = [];
// const geocoded = latest_company_facilities.map((e) => {
//   const prev: any = previously_geocoded.find((elt) => {
//     return (
//       elt.company === e.company &&
//       elt.facilityInternal === e.facilityInternal &&
//       // elt.agencyInternal === e.agencyInternal &&
//       elt.stateInternal === e.stateInternal
//     );
//   });

//   if (!prev) {
//     missing.push(e);
//     return;
//   }

//   return {
//     ...e,
//     googlePlaceName: prev.googlePlaceName,
//     address: prev.address,
//     longitude: prev.longitude,
//     latitude: prev.latitude,
//     county: prev.county,
//     googlePlaceId: prev.googlePlaceId,
//     state: prev.state,
//   };
// });

//   geocoded.push(...missing);
//   geocoded.sort((a: any, b: any) => a.id - b.id);

//   await serialize(geocoded, "./geocoded.csv");
// };

export const geocode_latest_company_facilities = async () => {
  const latest_company_facilities = await readCSV(
    "https://storage.googleapis.com/ptdp-staging.appspot.com/exports/company_facilities_1617551298692.csv"
  );

  const previously_geocoded = await readCSV(
    "https://raw.githubusercontent.com/PTDP/data/main/intermediate_data/geocoded_company_facilities.csv"
  );

  const needsGeocoding: any[] = [];

  const alreadyGeocoded: any[] = latest_company_facilities
    .map((e) => {
      const prev: any = previously_geocoded.find((elt) => {
        return (
          elt.company === e.company &&
          elt.facilityInternal === e.facilityInternal &&
          // elt.agencyInternal === e.agencyInternal &&
          elt.stateInternal === e.stateInternal
        );
      });

      if (!prev) {
        needsGeocoding.push(e);
        return null;
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
    })
    .filter(Boolean);

  console.log(needsGeocoding.length);
  console.log(alreadyGeocoded.length);

  const newlyGeocoded: any[] = [];

  for (let i = 0; i < needsGeocoding.length; i++) {
    console.log(`${i + 1}/${needsGeocoding.length}}`);
    const props = await getGeoCodedProps(needsGeocoding[i]);
    newlyGeocoded.push({
      ...needsGeocoding[i],
      ...props,
      state: needsGeocoding[i].stateInternal,
    });
  }

  const output = [...alreadyGeocoded, ...newlyGeocoded];

  output.sort((a: any, b: any) => a.id - b.id);

  await serialize(output, "./geocoded.csv");
};

const getGeoCodedProps = async (companyFacility: any) => {
  let formatted_address = "";
  let lat = "";
  let lng = "";
  let place_id = "";
  let name = "";
  let county = "";

  try {
    // if company is ICS, we cannot trust the reported state for each facility
    ({ formatted_address, lat, lng, name, place_id } =
      (await geocodeFacility(companyFacility)) || {});
  } catch (err) {
    console.error(err);
  }

  try {
    county = await reverseGeocodeFacilityGoogle(lat, lng);
  } catch (err) {
    console.error(err);
  }

  return {
    googlePlaceName: name,
    address: formatted_address,
    longitude: lng,
    latitude: lat,
    county,
    googlePlaceId: place_id,
  };
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

export const centroid = async () => {
  const BOUNDARIES_GEOJSON = (
    await axios.get(
      "https://firebasestorage.googleapis.com/v0/b/ptdp-staging.appspot.com/o/boundaries.json?alt=media&token=4468ee6a-57b1-4739-b039-1578544ca45d"
    )
  ).data;

  const HIFLD: any = await readCSV(
    "https://opendata.arcgis.com/datasets/2d6109d4127d458eaf0958e4c5296b67_0.csv?outSR=%7B%22latestWkid%22%3A3857%2C%22wkid%22%3A102100%7D"
  );

  for (const f of BOUNDARIES_GEOJSON.features) {
    f.geometry = {
      type: "Point",
      coordinates: turf.center(f).geometry!.coordinates,
    };

    const h = HIFLD.find(
      (el: any) => el.FACILITYID === f.properties.FACILITYID
    );

    const coords = turf.center(f).geometry!.coordinates;
    h.LONGITUDE = coords[0];
    h.LATITUDE = coords[1];
  }

  await serialize(HIFLD, "./hifld_geocoded.csv");
};
