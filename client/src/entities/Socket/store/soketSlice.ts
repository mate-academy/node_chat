import { createSlice } from '@reduxjs/toolkit'
import { SocketState } from '../types/SocketType';

const initialState: SocketState = {
  usersOnline: [],
}

export const socketSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    update: (state, action) => {
      state.usersOnline = action.payload
    }
  },
})

export const { update } = socketSlice.actions;
export default socketSlice.reducer;



