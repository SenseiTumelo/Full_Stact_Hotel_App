import { configureStore } from '@reduxjs/toolkit';
import hotelsReducer from './slices/hotelsSlice';
import authReducer from './slices/authSlice';
import bookingReducer from './slices/bookingSlice';



export const store = configureStore({
reducer: {
  hotels: hotelsReducer,
  auth: authReducer,
  booking: bookingReducer,
},

});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;