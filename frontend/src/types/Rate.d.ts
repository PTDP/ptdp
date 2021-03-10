import { Company, Service } from '@ptdp/lib';

export interface Rate {
  amountAdditional: number;
  amountInitial: number;
  company: Company;
  companyFacilityId: number;
  createdAt: string;
  durationAdditional: number;
  hiddenOverride: boolean;
  durationInitial: number;
  id: number;
  inState: boolean;
  notes: [];
  phone: string;
  pctTax: number | null;
  service: Service;
  source: string;
  uid: string;
  updated: string[];
}
