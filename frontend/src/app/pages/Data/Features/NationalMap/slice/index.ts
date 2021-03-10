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
} from './types';

export const initialState: NationalMapState = {
  facilities: [],
  filters: {
    call_type: 'in_state',
    geography: 'facility',
    company: FilterCompanies.ALL,
    facility_type: 'all',
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
