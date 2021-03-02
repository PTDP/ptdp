export interface ICanonicalFacility {
  name: string;
  jurisdiction?: Jurisdiction;
  address?: string;
  googlePlaceName?: string;
  longitude?: number;
  latitude?: number;
  state: State;
  county?: string;
  countyFIPS?: number;
  HIFLDID?: number;
  HIFLD_POPULATION?: number;
  HIFLD_CAPACITY?: number;
  HIFLD_SOURCE?: string;
  UCLACovid19ID?: number;
  UCLACovid19_POPULATION?: number;
  UCLACovid19_SOURCE?: string;
  UCLACovid19_SOURCEDATE?: string;
}

export interface ICompanyFacility {
  facilityInternal: string;
  agencyInternal: string;
  stateInternal: State;
  company: Company;
  canonicalFacility: number;
  createdAt: string;
}

export interface IRate {
  durationInitial?: number;
  durationAdditional?: number;
  amountInitial?: number;
  amountAdditional?: number;
  pctTax?: number;
  phone: string;
  inState: boolean;
  service: Service;
  source: string;
  company: Company;
  companyFacilityId: number;
  updatedAt: string[];
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
}

export enum Service {
  "Default" = 1,
  "AdvancedConnect" = 2,
  "Direct Bill" = 3,
  "Inmate Debit" = 4,
  "Traditional Collect" = 5,
  "Voicemail" = 6,
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
