import { all } from 'redux-saga/effects';
import mealsSaga from './meals.saga';
import authSaga from './auth.saga';
import waterSaga from './water.saga';
import gamificationSaga from './gamification.saga';
import insightsSaga from './insights.saga';

export default function* rootSaga() {
  yield all([
    mealsSaga(),
    authSaga(),
    waterSaga(),
    gamificationSaga(),
    insightsSaga(),
  ]);
}
