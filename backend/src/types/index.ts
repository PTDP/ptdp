export interface ICanonicalFacility {
  uid?: string;

  // determine whether to hide based on thresholds like how confident we are that
  // name matches
  hidden: boolean;
  HIFLDID: number | null;
  UCLACovid19ID: number | null;
  longitude: number | null;
  latitude: number | null;

  // allow for manual error correction in case of improper auto-coding
  name: string | null;
  jurisdiction: string | null;
  address: string | null;
  city: string | null;
  zip: number | null;
  state: State;
  county: string | null;
  countyFIPS: number | null;
  population: number | null;
  capacity: number | null;

  notes: string[];
}

// For export to git
export interface ICanonicalFacilityPublic
  extends Omit<ICanonicalFacility, "notes"> {
  notes: string | null;
}

export interface ICompanyFacility {
  uid?: string;
  facilityInternal: string;
  agencyInternal: string | null;
  agencyFullNameInternal: string | null;
  stateInternal: State | null;
  company: Company;
  canonicalFacilityId: number | null;
  created: string;
  notes: string[]; // store internalAgencyID, and publicAgencies for ICS here

  // allow manual hiding
  hidden_override: boolean | null;
}

// For export to git
export interface ICompanyFacilityPublic
  extends Omit<ICompanyFacility, "stateInternal" | "company" | "notes"> {
  stateInternal: string | null;
  company: string;
  notes: string | null;
}

export interface IRate {
  uid?: string;
  durationInitial: number | null;
  durationAdditional: number | null;
  amountInitial: number | null;
  amountAdditional: number | null;
  pctTax: number | null;
  phone: string;
  inState: boolean;
  service: Service;
  source: string;
  company: Company;
  companyFacilityId: number;
  updated: string[];
  notes: string[];

  // allow manual hiding
  hidden_override: boolean | null;
}

// For export to git
export interface IRatePublic
  extends Omit<IRate, "service" | "company" | "updated" | "notes"> {
  // id: string;
  service: string;
  company: string;
  updated: string;
  notes: string | null;
}

export enum Jurisdiction {
  "state" = 1,
  "county" = 2,
  "federal" = 3,
  "immigration" = 4,
}

export enum Company {
  "ICS" = 1,
  "SECURUS" = 2,
  "GTL" = 3,
}

export enum Service {
  "Default" = 1,
  "AdvancedConnect" = 2,
  "Direct Bill" = 3,
  "Inmate Debit" = 4,
  "Traditional Collect" = 5,
  "Voicemail" = 6,
  "GTL Collect" = 7,
  "GTL AdvancePay" = 8,
}

export enum State {
  "AL" = 1,
  "AK" = 2,
  "AZ" = 3,
  "AR" = 4,
  "CA" = 5,
  "CO" = 6,
  "CT" = 7,
  "DE" = 8,
  "FL" = 9,
  "GA" = 10,
  "HI" = 11,
  "ID" = 12,
  "IL" = 13,
  "IN" = 14,
  "IA" = 15,
  "KS" = 16,
  "KY" = 17,
  "LA" = 18,
  "ME" = 19,
  "MD" = 20,
  "MA" = 21,
  "MI" = 22,
  "MN" = 23,
  "MS" = 24,
  "MO" = 25,
  "MT" = 26,
  "NE" = 27,
  "NV" = 28,
  "NH" = 29,
  "NJ" = 30,
  "NM" = 31,
  "NY" = 32,
  "NC" = 33,
  "ND" = 34,
  "OH" = 35,
  "OK" = 36,
  "OR" = 37,
  "PA" = 38,
  "RI" = 39,
  "SC" = 40,
  "SD" = 41,
  "TN" = 42,
  "TX" = 43,
  "UT" = 44,
  "VT" = 45,
  "VA" = 46,
  "WA" = 47,
  "WV" = 48,
  "WI" = 49,
  "WY" = 50,
}

export interface JoinedCompanyFacility
  extends ICanonicalFacility,
    ICompanyFacility {
  longitude_override: number | null;
  latitude_override: number | null;
  HIFLDID_override: number | null;
  UCLACovid19ID_override: number | null;

  name_override: string | null;
  jurisdiction_override: string | null;
  address_override: string | null;
  city_override: string | null;
  zip_override: number | null;
  state_override: string | null;
  county_override: string | null;
  countyFIPS_override: number | null;
  population_override: number | null;
  capacity_override: number | null;
}

export interface HIFLD {
  FID: number;
  FACILITYID: number;
  NAME: string;
  ADDRESS: string;
  CITY: string;
  STATE: string;
  ZIP: number;
  ZIP4: number;
  TELEPHONE: string;
  TYPE: string;
  STATUS: string;
  POPULATION: string;
  COUNTY: string;
  COUNTYFIPS: number;
  COUNTRY: string;
  NAICS_CODE: number;
  NAICS_DESC: string;
  SOURCE: string;
  SOURCEDATE: string;
  VAL_METHOD: string;
  VAL_DATE: string;
  WEBSITE: string;
  SECURELVL: string;
  CAPACITY: number;
  SHAPE_Leng: number;
  SHAPE_Length: number;
  SHAPE_Area: number;
}
