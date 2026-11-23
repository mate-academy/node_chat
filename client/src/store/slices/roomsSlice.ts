import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Room } from '../../types/room';

interface RoomsState {
  rooms: Room[];
}

const initialState: RoomsState = {
  rooms: [],
};

export const roomsSlice = createSlice({
  name: 'rooms',
  initialState,
  reducers: {
    setRooms: (state, action: PayloadAction<Room[]>) => {
      state.rooms = action.payload;
    },
  },
});

export const { setRooms } = roomsSlice.actions;
