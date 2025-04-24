import { createSlice } from '@reduxjs/toolkit';
import { type ChatState } from '../types/ChatState';

const initialValue: ChatState = {
  rooms: [],
  users: [],
};

const chatRoomsSlice = createSlice({
  name: 'chatRooms',
  initialState: initialValue,
  reducers: {
    setChatRooms(state, action) {
      state.rooms = action.payload;
    },
    setUsers(state, action) {
      state.users = action.payload;
    },
    setCharFromSession(state, action) {
      state.rooms = action.payload.rooms;
      state.users = action.payload.users;
    },
  },
});

export default chatRoomsSlice.reducer;
export const { actions } = chatRoomsSlice;
