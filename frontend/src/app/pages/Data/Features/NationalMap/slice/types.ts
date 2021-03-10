import { Repo } from 'types/Repo';
import { Facility } from 'types/Facility';

export interface Filters {
  call_type: string;
  geography: string;
  company: FilterCompanies;
  facility_type: string;
}

export enum FilterCompanies {
  ICS = 1,
  SECURUS = 2,
  ALL = 3,
}

/* --- STATE --- */
export interface NationalMapState {
  facilities: Facility[];
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
