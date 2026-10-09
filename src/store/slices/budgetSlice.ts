import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { resetOnSignOut } from '@/store/slices/resetOnSignOut';
import type { LoadStatus, Budget } from '@/types';

export interface BudgetState {
  budgets: Budget[];
  status: LoadStatus;
}

const initialState: BudgetState = { budgets: [], status: 'idle' };

/** Budget bulanan (Dashboard + halaman Budget). */
export const budgetSlice = createSlice({
  name: 'budget',
  initialState,
  reducers: {
    setBudgetsLoading: state => {
      state.status = 'loading';
    },
    setBudgets: (state, action: PayloadAction<Budget[]>) => {
      state.budgets = action.payload;
      state.status = 'loaded';
    },
    setBudgetsFailed: state => {
      state.status = 'loaded';
    },
    addBudget: (state, action: PayloadAction<Budget>) => {
      state.budgets.push(action.payload);
    },
    updateBudget: (state, action: PayloadAction<Budget>) => {
      const index = state.budgets.findIndex(
        budget => budget.idBudget === action.payload.idBudget,
      );
      if (index !== -1) {
        state.budgets[index] = action.payload;
      }
    },
    removeBudget: (state, action: PayloadAction<string>) => {
      state.budgets = state.budgets.filter(
        budget => budget.idBudget !== action.payload,
      );
    },
  },
  extraReducers: builder => resetOnSignOut(builder, initialState),
});

export const {
  setBudgetsLoading,
  setBudgets,
  setBudgetsFailed,
  addBudget,
  updateBudget,
  removeBudget,
} = budgetSlice.actions;

export default budgetSlice.reducer;
