import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  approveBookingRequest,
  cancelBookingAdminRequest,
  completeBookingRequest,
  fetchAdminBooking,
  fetchAdminBookings,
  modifyBookingRequest,
} from '../../services/api';
import { getErrorMessage } from '../../utils/errors';
import type { Booking, BookingList, ModifyPayload } from '../../types/booking';

type Status = 'idle' | 'loading' | 'succeeded' | 'failed';
type Config = { rejectValue: string };

type State = {
  list: BookingList;
  listStatus: Status;
  listError: string | null;
  current: Booking | null;
  currentStatus: Status;
  actionBusy: boolean;
  actionError: string | null;
  actionNote: string | null;
};

const initialState: State = {
  list: { items: [], total: 0, page: 1, pageSize: 20 },
  listStatus: 'idle',
  listError: null,
  current: null,
  currentStatus: 'idle',
  actionBusy: false,
  actionError: null,
  actionNote: null,
};

export const loadAdminBookings = createAsyncThunk<
  BookingList,
  { status?: string; q?: string; page?: number },
  Config
>('adminBookings/loadList', async (params, { rejectWithValue }) => {
  try {
    return await fetchAdminBookings(params);
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const loadAdminBooking = createAsyncThunk<Booking, string, Config>(
  'adminBookings/loadOne',
  async (id, { rejectWithValue }) => {
    try {
      return await fetchAdminBooking(id);
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const approveAdminBooking = createAsyncThunk<Booking, string, Config>(
  'adminBookings/approve',
  async (id, { rejectWithValue }) => {
    try {
      return await approveBookingRequest(id);
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const cancelAdminBooking = createAsyncThunk<Booking, string, Config>(
  'adminBookings/cancel',
  async (id, { rejectWithValue }) => {
    try {
      return await cancelBookingAdminRequest(id);
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const completeAdminBooking = createAsyncThunk<Booking, string, Config>(
  'adminBookings/complete',
  async (id, { rejectWithValue }) => {
    try {
      return await completeBookingRequest(id);
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const modifyAdminBooking = createAsyncThunk<
  Booking,
  { id: string; payload: ModifyPayload },
  Config
>('adminBookings/modify', async ({ id, payload }, { rejectWithValue }) => {
  try {
    return await modifyBookingRequest(id, payload);
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

const slice = createSlice({
  name: 'adminBookings',
  initialState,
  reducers: {
    clearActionMessages(state) {
      state.actionError = null;
      state.actionNote = null;
    },
  },
  extraReducers: (builder) => {
    // After an action, the server returns the updated booking. Keep the detail page and the list in step.
    const applyUpdated = (state: State, booking: Booking, note: string) => {
      state.actionBusy = false;
      state.actionError = null;
      state.actionNote = note;
      state.current = booking;
      state.list.items = state.list.items.map((item) => (item.id === booking.id ? booking : item));
    };

    builder
      .addCase(loadAdminBookings.pending, (state) => {
        state.listStatus = 'loading';
        state.listError = null;
      })
      .addCase(loadAdminBookings.fulfilled, (state, action) => {
        state.listStatus = 'succeeded';
        state.list = action.payload;
      })
      .addCase(loadAdminBookings.rejected, (state, action) => {
        state.listStatus = 'failed';
        state.listError = action.payload ?? 'Could not load reservations';
      })

      .addCase(loadAdminBooking.pending, (state, action) => {
        // Keep showing the booking while it refreshes; only clear it when switching to another one
        if (state.current?.id !== action.meta.arg) {
          state.current = null;
          state.currentStatus = 'loading';
        }
        state.actionError = null;
        state.actionNote = null;
      })
      .addCase(loadAdminBooking.fulfilled, (state, action) => {
        state.currentStatus = 'succeeded';
        state.current = action.payload;
      })
      .addCase(loadAdminBooking.rejected, (state) => {
        state.currentStatus = 'failed';
      })

      .addCase(approveAdminBooking.fulfilled, (state, action) =>
        applyUpdated(state, action.payload, 'Booking approved.')
      )
      .addCase(cancelAdminBooking.fulfilled, (state, action) =>
        applyUpdated(
          state,
          action.payload,
          action.payload.payment_status === 'refunded'
            ? 'Booking cancelled and the guest was refunded in full.'
            : 'Booking cancelled.'
        )
      )
      .addCase(completeAdminBooking.fulfilled, (state, action) =>
        applyUpdated(state, action.payload, 'Stay marked as completed.')
      )
      .addCase(modifyAdminBooking.fulfilled, (state, action) =>
        applyUpdated(state, action.payload, 'Booking updated.')
      )

      .addMatcher(
        (action) =>
          [approveAdminBooking.pending.type, cancelAdminBooking.pending.type, completeAdminBooking.pending.type, modifyAdminBooking.pending.type].includes(action.type),
        (state) => {
          state.actionBusy = true;
          state.actionError = null;
          state.actionNote = null;
        }
      )
      .addMatcher(
        (action) =>
          [approveAdminBooking.rejected.type, cancelAdminBooking.rejected.type, completeAdminBooking.rejected.type, modifyAdminBooking.rejected.type].includes(action.type),
        (state, action) => {
          state.actionBusy = false;
          state.actionError = (action as { payload?: string }).payload ?? 'Something went wrong';
        }
      );
  },
});

export const { clearActionMessages } = slice.actions;
export default slice.reducer;
