import { PayloadAction } from '@reduxjs/toolkit';
import { Facility } from 'types/Facility';
import { createSlice } from 'utils/@reduxjs/toolkit';
import { useInjectReducer, useInjectSaga } from 'utils/redux-injectors';
import { nationalMapSaga } from './saga';
import {
  NationalMapState,
  RepoErrorType,
  Filters,
  FilterCompanies,
  CallType,
  Geography,
  FacilityType,
  SecureLVL,
} from './types';

export const initialState: NationalMapState = {
  facilities: [],
  counties: { features: [] },
  boundaries: { features: [] },
  states: { features: [] },
  filters: {
    call_type: CallType.IN_STATE,
    geography: Geography.COUNTY,
    company: [FilterCompanies.SECURUS, FilterCompanies.ICS, FilterCompanies.GTL],
    facility_type: [
      // FacilityType.LOCAL,
      FacilityType.COUNTY,
      // FacilityType.STATE,
      // FacilityType.FEDERAL,
      // FacilityType.MULTI,
    ],
    secure_level: [
      SecureLVL.CLOSE,
      SecureLVL.JUVENILE,
      SecureLVL.MAXIMUM,
      SecureLVL.MEDIUM,
      SecureLVL.MINIMUM,
      SecureLVL.NOT_AVAILABLE,
    ],
    fifteen_minute_percentiles: [0, 100],
    capacity_bounds: [0, 5000]
  },
  loading: false,
  error: null,
};

const slice = createSlice({
  name: 'nationalMap',
  initialState,
  reducers: {
    // changeUsername(state, action: PayloadAction<string>) {
    //   state.username = action.payload;
    // },
    loadFacilities(state) {
      state.loading = true;
      state.error = null;
      state.facilities = [];
    },
    facilitiesLoaded(state, action: PayloadAction<Facility[]>) {
      const facilities = action.payload;
      state.facilities = facilities;
      state.loading = false;
    },
    facilitiesError(state, action: PayloadAction<RepoErrorType>) {
      state.error = action.payload;
      state.loading = false;
    },
    updateFilters(state, action: PayloadAction<Filters>) {
      console.log(action.payload)

      if (action.payload.geography === Geography.COUNTY) {
        action.payload.facility_type = [FacilityType.COUNTY];
      } else if (action.payload.geography === Geography.LOCAL) {
        action.payload.facility_type = [FacilityType.LOCAL];
      } else if (action.payload.geography === Geography.STATE) {
        action.payload.facility_type = [FacilityType.STATE];
      }

      console.log(action.payload)

      state.filters = action.payload;
    },
    countiesLoaded(state, action: PayloadAction<any>) {
      state.counties = action.payload;
    },
    statesLoaded(state, action: PayloadAction<any>) {
      state.states = action.payload;
    },
    boundariesLoaded(state, action: PayloadAction<any>) {
      state.boundaries = action.payload;
    }
  },
});

export const { actions: nationalMapActions, reducer } = slice;

export const useNationalMapSlice = () => {
  useInjectReducer({ key: slice.name, reducer: slice.reducer });
  useInjectSaga({ key: slice.name, saga: nationalMapSaga });
  return { actions: slice.actions };
};
