export type Facility = {
    created_at?: string,
    updated_at?: string,
    
    raw_name: string;
    name: string,
    google_name: string;
    google_place_id: string;
    formatted_address: string;

    longitude: number,
    latitude: number,

    agency_id: number
    congressional_id: number;
    state_id: number;
    county_id: number;
}