import { configureStore } from '@reduxjs/toolkit';
import hotelsReducer from './slices/hotelsSlice';
import authReducer from './slices/authSlice';
import bookingReducer from './slices/bookingSlice';
import adminBookingsReducer from './slices/adminBookingsSlice';
import reviewsReducer from './slices/reviewsSlice';


export const store = configureStore({
reducer: {
  hotels: hotelsReducer,
  auth: authReducer,
  booking: bookingReducer,
  adminBookings: adminBookingsReducer,
  reviews: reviewsReducer,
},

});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;