import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { resetOnSignOut } from '@/store/slices/resetOnSignOut';
import type { Instrument, InvestmentAccount, LoadStatus } from '@/types';

export interface InstrumentState {
  instruments: Instrument[];
  status: LoadStatus;
}

const initialState: InstrumentState = { instruments: [], status: 'idle' };

/** Instrumen investasi + akun-akunnya. */
export const instrumentSlice = createSlice({
  name: 'instrument',
  initialState,
  reducers: {
    setInstrumentsLoading: state => {
      state.status = 'loading';
    },
    setInstruments: (state, action: PayloadAction<Instrument[]>) => {
      state.instruments = action.payload;
      state.status = 'loaded';
    },
    setInstrumentsFailed: state => {
      state.status = 'loaded';
    },
    addInstrument: (state, action: PayloadAction<Instrument>) => {
      state.instruments.push(action.payload);
    },
    updateInstrument: (state, action: PayloadAction<Instrument>) => {
      const index = state.instruments.findIndex(
        item => item.idInstrument === action.payload.idInstrument,
      );
      if (index !== -1) {
        state.instruments[index] = action.payload;
      }
    },
    removeInstrument: (state, action: PayloadAction<string>) => {
      state.instruments = state.instruments.filter(
        item => item.idInstrument !== action.payload,
      );
    },
    upsertInvestmentAccount: (
      state,
      action: PayloadAction<InvestmentAccount>,
    ) => {
      const instrument = state.instruments.find(
        item => item.idInstrument === action.payload.idInstrument,
      );
      if (!instrument) {
        return;
      }
      const index = instrument.investmentAccounts.findIndex(
        account =>
          account.idInvestmentAccount === action.payload.idInvestmentAccount,
      );
      if (index === -1) {
        instrument.investmentAccounts.push(action.payload);
      } else {
        instrument.investmentAccounts[index] = action.payload;
      }
    },
  },
  extraReducers: builder => resetOnSignOut(builder, initialState),
});

export const {
  setInstrumentsLoading,
  setInstruments,
  setInstrumentsFailed,
  addInstrument,
  updateInstrument,
  removeInstrument,
  upsertInvestmentAccount,
} = instrumentSlice.actions;

export default instrumentSlice.reducer;
