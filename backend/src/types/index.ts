export interface ICompanyFacility {
  id: string;
  facilityInternal: string;
  agencyInternal: string;
  stateInternal: string;
  company: "ICS" | "Securus";
  createdAt: string;
  canonicalFacility?: string;
  notes?: string;
}

export interface IFacility {
  id: string;
  name: string;
  jurisdiction?: "state" | "county" | "federal" | "immigration";
  agency?: string;
  createdAt: string; //
  populationFeb20?: number;
  residentsPopulation?: number;
  state: string;
  address?: string;
  zipcode?: number;
  city?: string;
  county?: string;
  latitude?: number;
  longitude?: number;
  countyFIPS?: number;
  HIFLID?: number;
}

export enum Service {
  "Default" = 1,
  "AdvancedConnect" = 2,
  "Direct Bill" = 3,
  "Inmate Debit" = 4,
  "Traditional Collect" = 5,
  "Voicemail" = 6,
}

export interface IRate {
  id: string;
  durationInitial?: number;
  durationAdditional?: number;
  amountInitial?: number;
  amountAdditional?: number;
  pctTax?: number;
  phone: string;
  inState: number;
  companyFacility: string;
  updatedAt: string;
  service: Service;
}
