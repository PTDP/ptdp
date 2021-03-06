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

export type ICSProduct = {
    agency_id: string; //"CULAL",
    site_id: 0; //0,
    state_cd: string; //"AL",
    state_nm: string; //"Alabama",
    lead_ani: string; //"2562977100",
    agency_nm: string; //"Cullman County Sheriffs Office",
    video_partner: number; //0,
    enable_video_visitation_scheduling: number; //1,
    enable_family_prepaid: number; //0,
    enable_phone_validation: number; //0,
    require_phone_validation: number; //0,
    full_nm: string; //"Alabama - Cullman County Sheriffs Office",
    idc: boolean; //false,
    ppd: boolean; //true,
    vid: boolean; //true,
    hasaccount: number; //0
    register_link: string; //null
};

export type ICSProductAppended = ICSProduct & {
    publicAgencies: string;
};

export type ICSFacility = {
    facility_nm: string; // "Morgan County Jail"
    site_id: number; // 5261
};

export type MultiStateICSProduct = ICSProduct & {
    site_id: number; //0,
};

export type ICSRawRate = {
    startTime: string; // "2021-03-05T15:35:56-05:00",
    duration: number; // 900
    callType: string; //prepaid_collect
    icos: string; //
    initDur: number; // 60
    overDur: number; // 60
    minimumCost: number; // 0
    from: {
        placeName: string; // "mainland"
        rateCenter: string; // DECATUR
        state: string; // AL
        nxxType: string; // POTS
    };
    to: {
        placeName: string; // "mainland"
        rateCenter: string; // DRIGGS
        state: string; // ID
        nxxType: string; // POT
        canonicalNumber: string; //12083544311
    };
    fees: [];
    taxes: {
        rrtCallTypes: number; // 0,
        bundledCallTypes: number; // 0,
        callTaxMicros: number; //0
    };
    summary: {
        tariffBand: string; // "Interstate";
        initialDuration: string; // "1 minute";
        initialCost: number; // 0.21;
        overDuration: string; // "1 minute";
        overCost: number; // 0.21;
        tax: number; // 0;
        finalCost: number; // 3.15;
    };
};
