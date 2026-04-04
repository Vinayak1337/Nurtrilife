import { all, call, put, takeEvery } from 'redux-saga/effects';
import dayjs from 'dayjs';

import {
  addWaterRequest,
  addWaterSuccess,
  addWaterFailure,
  WaterEntry,
} from '../slices/water.slice';
import { syncWaterToServer } from '@/services/sync.service';

function* addWaterSaga(action: ReturnType<typeof addWaterRequest>) {
  try {
    const entry: WaterEntry = {
      id: `water_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      amount: action.payload,
      date: dayjs().format('YYYY-MM-DD'),
      createdAt: new Date().toISOString(),
    };

    yield put(addWaterSuccess(entry));

    // Fire-and-forget server sync
    yield call(syncWaterToServer, entry);
  } catch (error) {
    yield put(addWaterFailure(error instanceof Error ? error.message : 'Failed to add water entry'));
  }
}

// ─── Watchers ─────────────────────────────────────────────────────────────────

function* watchAddWater() {
  yield takeEvery(addWaterRequest.type, addWaterSaga);
}

// ─── Domain saga ──────────────────────────────────────────────────────────────

export default function* waterSaga() {
  yield all([
    call(watchAddWater),
  ]);
}
