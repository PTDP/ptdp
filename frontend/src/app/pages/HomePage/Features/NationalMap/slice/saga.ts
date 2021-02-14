import { call, put, select, takeLatest, delay } from 'redux-saga/effects';
import { request } from 'utils/request';
// import { selectUsername } from './selectors';
import { nationalMapActions as actions } from '.';
import { Facility } from 'types/Facility';
import { RepoErrorType } from './types';
import client from '../../../../../../api';
import { FACILITIES_QUERY } from '../../../../../../api/queries';

// const processFacilities = facilities =>
//   facilities.map(f => {
//     const position = [f.longitude, f.latitude];
//     delete f.longitid
//   });
/**
 * Github repos request/response handler
 */
export function* loadFacilities() {
  try {
    const result: {
      data: {
        allFacilities: {
          nodes: Facility[];
        };
      };
    } = yield call(() =>
      client.query({
        query: FACILITIES_QUERY,
      }),
    );

    const facilities = result?.data?.allFacilities?.nodes;
    if (facilities?.length > 0) {
      console.log(facilities);
      yield put(actions.facilitiesLoaded(facilities));
    } else {
      yield put(actions.facilitiesError(RepoErrorType.USER_HAS_NO_REPO));
    }
  } catch (err) {
    console.error(err);
    if (err.response?.status === 404) {
      yield put(actions.facilitiesError(RepoErrorType.USER_NOT_FOUND));
    } else if (err.message === 'Failed to fetch') {
      yield put(actions.facilitiesError(RepoErrorType.GITHUB_RATE_LIMIT));
    } else {
      yield put(actions.facilitiesError(RepoErrorType.RESPONSE_ERROR));
    }
  }
}

/**
 * Root saga manages watcher lifecycle
 */
export function* nationalMapSaga() {
  // Watches for loadRepos actions and calls getRepos when one comes in.
  // By using `takeLatest` only the result of the latest API call is applied.
  // It returns task descriptor (just like fork) so we can continue execution
  // It will be cancelled automatically on component unmount
  yield takeLatest(actions.loadFacilities.type, loadFacilities);
}
