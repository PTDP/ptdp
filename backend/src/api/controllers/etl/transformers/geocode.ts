import * as functions from "firebase-functions";
import axios from "axios";
// import querystring from "querystring";

import State from "../../../models/state";
import County from "../../../models/county";
import Facility from "../../../models/facility";

const PLACES_KEY = functions.config().google.places;

const geocodeFacility = async (facility: Facility) => {
  const state = await State.query().findOne("id", "=", facility.state_id);
  const query = `${facility.name.split(" ").join("+")}+in+${state.name
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
    await facility.$query().patch({
      formatted_address,
      latitude: lat,
      longitude: lng,
      google_name: name,
      google_place_id: place_id,
    });
  }
};

const reverseGeocodeFacilityGoogle = async (facility: Facility) => {
  const query = `latlng=${facility.latitude},${facility.longitude}`;
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
    console.log("COULD NOT FIND ADMIN_LEVEL_2 ", facility.name);
    return;
  }

  const c =
    (await County.query().findOne("name", "=", county.long_name)) ||
    (await County.query().findOne("name", "=", county.short_name));

  if (!c) {
    console.log("COULD NOT FIND ", county.short_name);
    return;
  }

  console.log(`Patching ${facility.name}: ${c.name}`);
  await facility.$query().patch({
    county_id: c.id,
  });
};

// const reverseGeocodeFacilityCensus = async (facility: Facility) => {
//   try {
//     if (!facility.formatted_address) {
//       console.error(`No formatted address for ${facility.name}`);
//       return;
//     }

//     const { result } = (
//       await axios.get(
//         `https://geocoding.geo.census.gov/geocoder/geographies/onelineaddress?${querystring.stringify(
//           { address: facility.formatted_address }
//         )}&benchmark=4&vintage=4&format=json`
//       )
//     ).data;
//     if (result.addressMatches[0]) {
//       const { GEOID, STUSAB } = result.addressMatches[0].geographies.States[0];
//       const { COUNTY, NAME } = result.addressMatches[0].geographies.Counties[0];
//       let c = (
//         await County.query()
//           .where("fips", "=", COUNTY)
//           .where("state_fips", "=", GEOID)
//       ).find(Boolean);

//       if (!c) {
//         console.log(`Creating new county: ${COUNTY}, ${STUSAB}`);
//         c = await County.query().insert({
//           state_fips: GEOID,
//           fips: COUNTY,
//           name: NAME,
//         });
//       }

//       await facility.$query().patch({
//         county_id: c?.id,
//       });

//       console.log(`Reverse Geocoded ${facility.name}: ${NAME}`);
//     }
//   } catch (err) {
//     console.error(`${facility.name}:`, err);
//   }
// };

export const facilities = async (force = false) => {
  const fcs = await Facility.query();
  // let done = false;
  for (const facility of fcs) {
    if (!facility.google_place_id || force) {
      await geocodeFacility(facility);
    }
    if (!facility.county_id && facility.latitude && facility.longitude) {
      await reverseGeocodeFacilityGoogle(facility);
    }
  }
};
