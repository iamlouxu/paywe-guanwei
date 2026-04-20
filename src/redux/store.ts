import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import groupsReducer from './slices/groupsSlice';
import expensesReducer from './slices/expensesSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    groups: groupsReducer,
    expenses: expensesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
