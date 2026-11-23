import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Room } from '../../types/room';

interface CurrentRoomState {
  currentRoom: Room | null;
}

const initialState: CurrentRoomState = {
  currentRoom: null,
};

export const currentRoomSlice = createSlice({
  name: 'currentRoom',
  initialState,
  reducers: {
    setCurrentRoom: (state, action: PayloadAction<Room | null>) => {
      state.currentRoom = action.payload;
    },

    clearCurrentRoom: (state) => {
      state.currentRoom = null;
    },
  },
});

export const { setCurrentRoom, clearCurrentRoom } = currentRoomSlice.actions;
