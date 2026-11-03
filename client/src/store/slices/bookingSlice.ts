import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import {
  cancelBookingRequest,
  createBookingRequest,
  fetchAvailability,
  fetchMyBookings,
} from '../../services/api';
import { getErrorMessage } from '../../utils/errors';
import type { Booking, BookingDraft, BookingPayload, RoomAvailability } from '../../types/booking';

type Status = 'idle' | 'loading' | 'succeeded' | 'failed';

type BookingState = {
  draft: BookingDraft | null;
  availability: RoomAvailability[];
  availabilityStatus: Status;
  availabilityRequestId: string | null;
  submitStatus: Status;
  submitError: string | null;
  confirmed: Booking | null;
  mine: Booking[];
  mineStatus: Status;
  mineError: string | null;
};

const initialState: BookingState = {
  draft: null,
  availability: [],
  availabilityStatus: 'idle',
  availabilityRequestId: null,
  submitStatus: 'idle',
  submitError: null,
  confirmed: null,
  mine: [],
  mineStatus: 'idle',
  mineError: null,
};

export const loadAvailability = createAsyncThunk(
  'booking/loadAvailability',
  async (arg: { hotelId: string; checkIn: string; checkOut: string }) =>
    fetchAvailability(arg.hotelId, arg.checkIn, arg.checkOut)
);

export const submitBooking = createAsyncThunk<Booking, BookingPayload, { rejectValue: string }>(
  'booking/submit',
  async (payload, { rejectWithValue }) => {
    try {
      return await createBookingRequest(payload);
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const loadMyBookings = createAsyncThunk<Booking[], void, { rejectValue: string }>(
  'booking/loadMine',
  async (_arg, { rejectWithValue }) => {
    try {
      return await fetchMyBookings();
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const cancelMyBooking = createAsyncThunk<Booking, string, { rejectValue: string }>(
  'booking/cancel',
  async (id, { rejectWithValue }) => {
    try {
      return await cancelBookingRequest(id);
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    setDraft(state, action: PayloadAction<BookingDraft>) {
      state.draft = action.payload;
      state.submitStatus = 'idle';
      state.submitError = null;
    },
    clearDraft(state) {
      state.draft = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Availability
      .addCase(loadAvailability.pending, (state, action) => {
        state.availabilityStatus = 'loading';
        state.availabilityRequestId = action.meta.requestId;
      })
      .addCase(loadAvailability.fulfilled, (state, action) => {
        // Ignore a slow, older answer that arrives after a newer one was requested
        if (state.availabilityRequestId !== action.meta.requestId) return;
        state.availabilityStatus = 'succeeded';
        state.availability = action.payload;
      })
      .addCase(loadAvailability.rejected, (state, action) => {
        if (state.availabilityRequestId !== action.meta.requestId) return;
        state.availabilityStatus = 'failed';
      })
      // Creating a booking
      .addCase(submitBooking.pending, (state) => {
        state.submitStatus = 'loading';
        state.submitError = null;
      })
      .addCase(submitBooking.fulfilled, (state, action) => {
        state.submitStatus = 'succeeded';
        state.confirmed = action.payload;
      })
      .addCase(submitBooking.rejected, (state, action) => {
        state.submitStatus = 'failed';
        state.submitError = action.payload ?? 'Could not complete your booking';
      })
      // My trips
      .addCase(loadMyBookings.pending, (state) => {
        state.mineStatus = 'loading';
        state.mineError = null;
      })
      .addCase(loadMyBookings.fulfilled, (state, action) => {
        state.mineStatus = 'succeeded';
        state.mine = action.payload;
      })
      .addCase(loadMyBookings.rejected, (state, action) => {
        state.mineStatus = 'failed';
        state.mineError = action.payload ?? 'Could not load your bookings';
      })
      .addCase(cancelMyBooking.fulfilled, (state, action) => {
        state.mineError = null;
        state.mine = state.mine.map((b) => (b.id === action.payload.id ? action.payload : b));
      })
      .addCase(cancelMyBooking.rejected, (state, action) => {
        state.mineError = action.payload ?? 'Could not cancel the booking';
      });
  },
});

export const { setDraft, clearDraft } = bookingSlice.actions;
export default bookingSlice.reducer;