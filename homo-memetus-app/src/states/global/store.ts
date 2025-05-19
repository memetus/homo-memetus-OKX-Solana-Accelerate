'use client';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import theme from '@/states/global/slice/theme';
import modal from '@/states/global/slice/modal';
import toast from '@/states/global/slice/toast';

const rootReducer = combineReducers({
  theme,
  modal,
  toast,
  // Add reducers here
});

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;

export default store;
