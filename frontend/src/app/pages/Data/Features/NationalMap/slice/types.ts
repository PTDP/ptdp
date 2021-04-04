import { Repo } from 'types/Repo';
import { Facility } from 'types/Facility';

export interface Filters {
  call_type: CallType;
  geography: Geography[];
  company: FilterCompanies[];
  facility_type: FacilityType[];
  secure_level: SecureLVL[];
  fifteen_minute_percentiles: number[];
  capacity_bounds: number[];
}

export enum Geography {
  FACILITY = 1,
  COUNTY = 2,
  STATE = 3,
  POPULATION = 4,
  FIFTEEN_MINUTE_HEATMAP = 5
}

export enum FilterCompanies {
  ICS = 1,
  SECURUS = 2,
  GTL = 3,
  ALL = 4,
}

export enum CallType {
  IN_STATE = 1,
  OUT_STATE = 2,
}

export enum FacilityType {
  LOCAL = 'LOCAL',
  COUNTY = 'COUNTY',
  STATE = 'STATE',
  FEDERAL = 'FEDERAL',
  MULTI = 'MULTI',
  ALL = 'ALL',
}

export enum SecureLVL {
  CLOSE = 'CLOSE',
  JUVENILE = 'JUVENILE',
  MAXIMUM = 'MAXIMUM',
  MEDIUM = 'MEDIUM',
  MINIMUM = 'MINIMUM',
  NOT_AVAILABLE = 'NOT AVAILABLE',
  ALL = 'ALL',
}

/* --- STATE --- */
export interface NationalMapState {
  facilities: Facility[];
  counties: { features: any[] };
  boundaries: { features: any[] };
  filters: Filters;
  loading: boolean;
  error?: RepoErrorType | null;
}

export enum RepoErrorType {
  RESPONSE_ERROR = 1,
  USER_NOT_FOUND = 2,
  USERNAME_EMPTY = 3,
  USER_HAS_NO_REPO = 4,
  GITHUB_RATE_LIMIT = 5,
}

/* 
  If you want to use 'ContainerState' keyword everywhere in your feature folder, 
  instead of the 'HomePageState' keyword.
*/
export type ContainerState = NationalMapState;
