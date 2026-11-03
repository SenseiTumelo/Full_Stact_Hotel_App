import { configureStore } from '@reduxjs/toolkit';
import hotelsReducer from './slices/hotelsSlice';
import authReducer from './slices/authSlice';



export const store = configureStore({
  reducer: {
  hotels: hotelsReducer,
  auth: authReducer,
},
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;