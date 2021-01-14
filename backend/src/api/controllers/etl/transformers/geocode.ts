import PLACES_KEY from functions.config().google.places;
import axios from 'axios';

const BASEURL = 'https://maps.googleapis.com/maps/api/place/textsearch/json?query=';

export const facilities = async (force = false) => {
    // get all facilities, 
        // unless there is a force parameter, filter out those that already have formatted_address
        // convert stusab to to state name 
        // 
        // const results = await request BASEURL + urlEncode(facility.name + 'in' + stusab to to state name )
        // const { formatted_address, geometry: { location: lat, lng }, name } = results[0];
        // then you need to get congress_fips, and county_fips from lat and long
}