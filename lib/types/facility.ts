export type Facility = {
    created_at: Date,
    updated_at: Date,
    
    raw_name: string;
    name: string,
    congressional_fips: number,
    state_fips: number,
    county_fips: number,
    longitude: number,
    latitude: number,

    agency_id: number
}