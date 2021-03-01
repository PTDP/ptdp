export interface IFacility {
  id: string;
  name: string;
  jurisdiction?: "state" | "county" | "federal" | "immigration";
  agency: string;
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
  rawName: string;
}

export interface IRate {
  id: string;
  durationInitial?: number;
  durationAdditional?: number;
  amountInitial?: number;
  amountAdditional?: number;
  amountTax?: number;
  phone: string;
  inState: boolean;
  facility: string;
  updatedAt: string;
  service:
    | "Default Phone"
    | "AdvancedConnect"
    | "Direct Bill"
    | "Inmate Debit"
    | "Traditional Collect"
    | "Voicemail";
}
