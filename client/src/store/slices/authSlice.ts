import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { fetchCurrentUser, logoutRequest } from '../../services/api';
import type { User } from '../../types/user';

type AuthState = {
  user: User | null;
  status: 'idle' | 'loading' | 'ready'; // "ready" = we know whether someone is logged in
};

const initialState: AuthState = { user: null, status: 'idle' };

export const loadCurrentUser = createAsyncThunk('auth/loadCurrentUser', async () => {
  return await fetchCurrentUser();
});

export const logout = createAsyncThunk('auth/logout', async () => {
  await logoutRequest();
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadCurrentUser.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(loadCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.status = 'ready';
      })
      .addCase(loadCurrentUser.rejected, (state) => {
        state.user = null; // 401 simply means "not logged in"
        state.status = 'ready';
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
      });
  },
});

export default authSlice.reducer;