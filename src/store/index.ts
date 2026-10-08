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
import auth from '@/store/slices/authSlice';
import settings from '@/store/slices/settingsSlice';

const rootReducer = combineReducers({ auth, settings });

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
