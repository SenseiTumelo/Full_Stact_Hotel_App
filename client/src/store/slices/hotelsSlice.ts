import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { fetchHotels, fetchHotelById } from '../../services/api';
import type { HotelSearch } from '../../services/api';
import type { Hotel, HotelDetails } from '../../types/hotel';

type Status = 'idle' | 'loading' | 'succeeded' | 'failed';

type HotelsState = {
  items: Hotel[];
  status: Status;
  error: string | null;
  selected: HotelDetails | null;
  selectedStatus: Status;
};

const initialState: HotelsState = {
  items: [],
  status: 'idle',
  error: null,
  selected: null,
  selectedStatus: 'idle',
};

export const loadHotels = createAsyncThunk(
  'hotels/load',
  async (search: HotelSearch | undefined) => {
    return await fetchHotels(search);
  }
);

export const loadHotelById = createAsyncThunk(
  'hotels/loadById',
  async (id: string) => {
    return await fetchHotelById(id);
  }
);

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
      })
      .addCase(loadHotelById.pending, (state) => {
        state.selectedStatus = 'loading';
        state.selected = null; // don't flash the previous hotel
      })
      .addCase(loadHotelById.fulfilled, (state, action) => {
        state.selectedStatus = 'succeeded';
        state.selected = action.payload;
      })
      .addCase(loadHotelById.rejected, (state) => {
        state.selectedStatus = 'failed';
      });
  },
});

export default hotelsSlice.reducer;