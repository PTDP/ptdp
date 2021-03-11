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
  filters: {
    call_type: CallType.IN_STATE,
    geography: [Geography.FACILITY, Geography.COUNTY],
    company: [FilterCompanies.SECURUS, FilterCompanies.ICS],
    facility_type: [
      FacilityType.LOCAL,
      FacilityType.COUNTY,
      FacilityType.STATE,
      FacilityType.FEDERAL,
      FacilityType.MULTI,
    ],
    secure_level: [
      SecureLVL.CLOSE,
      SecureLVL.JUVENILE,
      SecureLVL.MAXIMUM,
      SecureLVL.MEDIUM,
      SecureLVL.MINIMUM,
      SecureLVL.NOT_AVAILABLE,
    ],
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
      state.filters = action.payload;
    },
  },
});

export const { actions: nationalMapActions, reducer } = slice;

export const useNationalMapSlice = () => {
  useInjectReducer({ key: slice.name, reducer: slice.reducer });
  useInjectSaga({ key: slice.name, saga: nationalMapSaga });
  return { actions: slice.actions };
};
