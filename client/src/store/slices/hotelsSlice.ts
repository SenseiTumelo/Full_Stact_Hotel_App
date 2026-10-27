import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { fetchHotels } from '../../services/api';
import type { Hotel } from '../../types/hotel';

type HotelsState = {
  items: Hotel[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
};

const initialState: HotelsState = {
  items: [],
  status: 'idle',
  error: null,
};

// The thunk: calls the API. Redux creates pending/fulfilled/rejected actions for us.
export const loadHotels = createAsyncThunk('hotels/load', async () => {
  return await fetchHotels();
});

const hotelsSlice = createSlice({
  name: 'hotels',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadHotels.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loadHotels.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(loadHotels.rejected, (state) => {
        state.status = 'failed';
        state.error = 'Could not load hotels';
      });
  },
});

export default hotelsSlice.reducer;