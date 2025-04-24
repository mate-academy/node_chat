import { createSlice } from '@reduxjs/toolkit';
import { type AuthState } from '../types/AuthState';

const initialValue: AuthState = {
  user: undefined,
  isAuthenticated: false,
  accessToken: undefined,
};

const AuthSlice = createSlice({
  name: 'auth',
  initialState: initialValue,
  reducers: {
    loginSuccess(state, action) {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
    },
    logout(state) {
      state.isAuthenticated = false;
      state.accessToken = undefined;
    },
    setAuthFromSession(state, action) {
      state.isAuthenticated = action.payload.isAuthenticated;
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
    },
  },
});

export default AuthSlice.reducer;
export const { actions } = AuthSlice;
