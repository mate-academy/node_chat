import { createSlice } from '@reduxjs/toolkit'
import { UserState } from '../types/userTypes'
import { login, register } from './authThunks'
import { handleAuthCase } from './service'

const initialState: UserState = {
  user: null,
  accessToken: '',
  loading: false,
  error: ''
}

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
    },
    removeUser: (state) => {
      state.user = null;
    },
    clearError: (state) => {
      state.error = '';
    }

  },
  extraReducers: (builder) => {
    builder.addCase(register.pending, handleAuthCase)
    builder.addCase(register.fulfilled, handleAuthCase)
    builder.addCase(register.rejected, handleAuthCase)

    builder.addCase(login.pending, handleAuthCase)
    builder.addCase(login.fulfilled, handleAuthCase)
    builder.addCase(login.rejected, handleAuthCase)
  }
})

export const { setUser, removeUser, clearError } = userSlice.actions;
export default userSlice.reducer;

