export interface Facility {
  createdAt: string;
  hidden: boolean;
  hifldid: number;
  id: number;
  longitude: number;
  latitude: number;
  hifldByHifldid: {
    capacity: number;
    city: string;
    country: string;
    county: string;
    countyfips: number;
    zip: number;
    status: string;
    telephone: string;
    state: string;
    population: number;
    name: string;
    type: string;
    sourcedate: string;
    source: string;
  };
  companyFacilitiesByCanonicalFacilityId: {
    nodes: CF[];
  };
}

type CF = {
  id: number;
  facilityInternal: string;
  company: number;
  ratesByCompanyFacilityId: {
    nodes: Rate[];
  };
};

type Rate = {
  amountAdditional: number;
  amountInitial: number;
  company: number;
  durationAdditional: number;
  durationInitial: number;
  inState: boolean;
  notes: string[];
  pctTax: number | null;
  phone: string;
  service: number;
  uid: string;
  updated: string[];
};
