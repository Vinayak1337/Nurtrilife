import { all } from 'redux-saga/effects';
import mealsSaga from './meals.saga';

export default function* rootSaga() {
  yield all([mealsSaga()]);
}
