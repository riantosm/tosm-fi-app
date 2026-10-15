import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import {
  FLUSH,
  PAUSE,
  PERSIST,
  persistReducer,
  persistStore,
  PURGE,
  REGISTER,
  REHYDRATE,
} from 'redux-persist';
import appLock from '@/store/slices/appLockSlice';
import auth from '@/store/slices/authSlice';
import budget from '@/store/slices/budgetSlice';
import category from '@/store/slices/categorySlice';
import instrument from '@/store/slices/instrumentSlice';
import schedule from '@/store/slices/scheduleSlice';
import scheduleOccurrence from '@/store/slices/scheduleOccurrenceSlice';
import settings from '@/store/slices/settingsSlice';
import transaction from '@/store/slices/transactionSlice';
import wallet from '@/store/slices/walletSlice';

const rootReducer = combineReducers({
  auth,
  // Persist sendiri (bukan lewat whitelist root) supaya `isLocked` tidak ikut tersimpan:
  // setiap app dibuka state awalnya terkunci.
  appLock: persistReducer(
    { key: 'appLock', storage: AsyncStorage, blacklist: ['isLocked'] },
    appLock,
  ),
  settings,
  wallet,
  category,
  budget,
  instrument,
  schedule,
  scheduleOccurrence,
  transaction,
});

const persistedReducer = persistReducer(
  {
    key: 'root',
    storage: AsyncStorage,
    // Hanya sesi login + preferensi lokal. Data domain selalu di-fetch ulang.
    whitelist: ['auth', 'settings'],
  },
  rootReducer,
);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
