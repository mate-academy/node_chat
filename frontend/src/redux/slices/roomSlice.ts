/* eslint-disable no-param-reassign */
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { RootState } from '../store.ts';
import { CreateRoomDto, CreateRoomDtoUpdate, Room } from '../../types/room.ts';
import {
  createRoom,
  deleteRoom,
  getAllRooms,
  updateRoom,
} from '../../api/rooms.ts';

export interface roomState {
  loaded: boolean;
  rooms: Room[];
  selectedRoom: Room | null;
}

const initialState: roomState = {
  loaded: false,
  rooms: [],
  selectedRoom: null,
};

export const initRooms = createAsyncThunk('newRooms/FETCH', () =>
  getAllRooms(),
);
export const initCreateRoom = createAsyncThunk(
  'roomsCreate/FETCH',
  (date: CreateRoomDto) => createRoom(date),
);
export const initDeleteRoom = createAsyncThunk(
  'roomsDelete/FETCH',
  (id: string) => deleteRoom(id),
);
export const initUpdateRoom = createAsyncThunk(
  'roomUpdate/FETCH',
  (date: CreateRoomDtoUpdate) => updateRoom(date.id, date.name),
);

export const roomSlice = createSlice({
  name: 'rooms',
  initialState,
  reducers: {
    setRooms: (state, actions) => {
      state.rooms = actions.payload;
    },
    setSelectRoom: (state, action) => {
      state.selectedRoom = action.payload;
    },
  },

  extraReducers(builder) {
    builder.addCase(initRooms.pending, (state) => {
      state.loaded = true;
    });
    builder.addCase(initRooms.fulfilled, (state, action) => {
      state.rooms = action.payload;
      state.loaded = false;
    });
    builder.addCase(initRooms.rejected, (state) => {
      state.loaded = false;
    });

    builder.addCase(initCreateRoom.pending, (state) => {
      state.loaded = true;
    });
    builder.addCase(initCreateRoom.fulfilled, (state, action) => {
      state.rooms = [...state.rooms, action.payload];
      state.loaded = false;
    });
    builder.addCase(initCreateRoom.rejected, (state) => {
      state.loaded = false;
    });

    builder.addCase(initDeleteRoom.pending, (state) => {
      state.loaded = true;
    });
    builder.addCase(initDeleteRoom.fulfilled, (state) => {
      state.loaded = false;
    });
    builder.addCase(initDeleteRoom.rejected, (state) => {
      state.loaded = false;
    });

    builder.addCase(initUpdateRoom.pending, (state) => {
      state.loaded = true;
    });
    builder.addCase(initUpdateRoom.fulfilled, (state) => {
      state.loaded = false;
    });
    builder.addCase(initUpdateRoom.rejected, (state) => {
      state.loaded = false;
    });
  },
});

export const { setRooms, setSelectRoom } = roomSlice.actions;

export const selectRooms = (state: RootState) => state.rooms;

export default roomSlice.reducer;
