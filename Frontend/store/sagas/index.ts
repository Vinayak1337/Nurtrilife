import { all, call } from 'redux-saga/effects';
import mealsSaga from './meals.saga';
import authSaga from './auth.saga';
import waterSaga from './water.saga';
import gamificationSaga from './gamification.saga';
import insightsSaga from './insights.saga';

export default function* rootSaga() {
  yield all([
    call(mealsSaga),
    call(authSaga),
    call(waterSaga),
    call(gamificationSaga),
    call(insightsSaga),
  ]);
}
