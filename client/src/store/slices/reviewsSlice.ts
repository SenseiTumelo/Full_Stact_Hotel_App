import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { createReviewRequest, deleteReviewRequest, fetchHotelReviews } from '../../services/api';
import { getErrorMessage } from '../../utils/errors';
import type { Review, ReviewSummary } from '../../types/review';

type Status = 'idle' | 'loading' | 'succeeded' | 'failed';
type Config = { rejectValue: string };

type ReviewsState = {
  hotelId: string | null; // which hotel the data below belongs to
  average: number;
  count: number;
  items: Review[];
  status: Status;
  submitStatus: Status;
  submitError: string | null;
  removeError: string | null;
};

const initialState: ReviewsState = {
  hotelId: null,
  average: 0,
  count: 0,
  items: [],
  status: 'idle',
  submitStatus: 'idle',
  submitError: null,
  removeError: null,
};

export const loadReviews = createAsyncThunk<ReviewSummary, string>(
  'reviews/load',
  async (hotelId) => fetchHotelReviews(hotelId)
);

export const submitReview = createAsyncThunk<
  { id: string; hotelId: string },
  { bookingId: string; rating: number; comment?: string },
  Config
>('reviews/submit', async (payload, { rejectWithValue }) => {
  try {
    return await createReviewRequest(payload);
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const removeReview = createAsyncThunk<void, string, Config>(
  'reviews/remove',
  async (id, { rejectWithValue }) => {
    try {
      await deleteReviewRequest(id);
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

const reviewsSlice = createSlice({
  name: 'reviews',
  initialState,
  reducers: {
    resetSubmit(state) {
      state.submitStatus = 'idle';
      state.submitError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadReviews.pending, (state, action) => {
        // A different hotel: clear the old reviews. The same hotel: keep showing them while refreshing.
        if (state.hotelId !== action.meta.arg) {
          state.hotelId = action.meta.arg;
          state.items = [];
          state.average = 0;
          state.count = 0;
          state.status = 'loading';
        }
      })
      .addCase(loadReviews.fulfilled, (state, action) => {
        if (state.hotelId !== action.meta.arg) return; // the guest already moved to another hotel
        state.status = 'succeeded';
        state.average = action.payload.average;
        state.count = action.payload.count;
        state.items = action.payload.items;
      })
      .addCase(loadReviews.rejected, (state, action) => {
        if (state.hotelId !== action.meta.arg) return;
        state.status = 'failed';
      })
      .addCase(submitReview.pending, (state) => {
        state.submitStatus = 'loading';
        state.submitError = null;
      })
      .addCase(submitReview.fulfilled, (state) => {
        state.submitStatus = 'succeeded';
      })
      .addCase(submitReview.rejected, (state, action) => {
        state.submitStatus = 'failed';
        state.submitError = action.payload ?? 'Could not save your review';
      })
      .addCase(removeReview.pending, (state) => {
        state.removeError = null;
      })
      .addCase(removeReview.rejected, (state, action) => {
        state.removeError = action.payload ?? 'Could not remove the review';
      });
  },
});

export const { resetSubmit } = reviewsSlice.actions;
export default reviewsSlice.reducer;