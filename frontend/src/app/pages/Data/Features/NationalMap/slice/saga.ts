import { call, all, put, select, takeLatest, delay } from 'redux-saga/effects';
import { request } from 'utils/request';
import { nationalMapActions as actions } from '.';
import { RepoErrorType } from './types';
import { Facility } from 'types/Facility';
import { Rate } from 'types/Rate';
import client from '../../../../../../api';
import { FACILITIES_QUERY } from '../../../../../../api/queries';
/**
 * Github repos request/response handler
 */
export function* loadFacilities() {
  try {
    const [f_response]: [
      {
        data: {
          allCanonicalFacilities: {
            nodes: Facility[];
          };
        };
      },
      {
        data: {
          allRates: {
            nodes: Rate[];
          };
        };
      },
    ] = yield all([
      call(() =>
        client.query({
          query: FACILITIES_QUERY,
        }),
      ),
    ]);

    // match all
    console.log(f_response[0]);

    const facilities = f_response?.data?.allCanonicalFacilities?.nodes;

    if (facilities?.length > 0) {
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
