export type Stusab =
    | "AL"
    | "AK"
    | "AZ"
    | "AR"
    | "CA"
    | "CO"
    | "CT"
    | "DE"
    | "FL"
    | "GA"
    | "HI"
    | "ID"
    | "IL"
    | "IN"
    | "IA"
    | "KS"
    | "KY"
    | "LA"
    | "ME"
    | "MD"
    | "MA"
    | "MI"
    | "MN"
    | "MS"
    | "MO"
    | "MT"
    | "NE"
    | "NV"
    | "NH"
    | "NJ"
    | "NM"
    | "NY"
    | "NC"
    | "ND"
    | "OH"
    | "OK"
    | "OR"
    | "PA"
    | "RI"
    | "SC"
    | "SD"
    | "TN"
    | "TX"
    | "UT"
    | "VT"
    | "VA"
    | "WA"
    | "WV"
    | "WI"
    | "WY";

export type ScraperInput = {
    uuid: string;
    createdAt: number;
    data: {
        [K in Stusab]?: StateInput;
    };
};

export type StateInput = {
    in_state_phone: string;
    out_state_phone: string;
    state_fips: string;
    stusab: string;
};

export type ICSFacility = {
    facility_nm: string; // "Morgan County Jail"
    site_id: number; // 5261
};

export type GTLMetadata = {
    headers: any;
    viewState: string;
    prefix1: string;
    prefix2: string;
};

export type GTLRate = {
    service: string;
    facility: string;
    subFacility: string | null;
    phone: string;
    state: string;
    createdAt: number;
    scraper: string;

    source: string;
    amountInitial: number | null;
    durationInitial: number | null;
    durationAdditional: number | null;
    amountAdditional: number | null;
    liveAgentFee: number | null;
    automatedPaymentFee: number | null;
    paperBillStatementFee: number | null;
    localCallTimeFacility: string;
};
