import { createSelector } from '@reduxjs/toolkit';

import { RootState } from 'types';
import { initialState } from '.';

// First select the relevant part from the state
const selectDomain = (state: RootState) => state.nationalMap || initialState;

export const selectPoints = createSelector(
  [selectDomain],
  nationalMapState => nationalMapState.points,
);

export const selectLoading = createSelector(
  [selectDomain],
  nationalMapState => nationalMapState.loading,
);

export const selectError = createSelector(
  [selectDomain],
  nationalMapState => nationalMapState.error,
);
