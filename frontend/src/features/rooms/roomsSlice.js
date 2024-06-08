import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

const initError = {
  status: false,
  message: ''
};

const initialState = {
  rooms: [],
  loading: false,
  error: initError,
};

export const addRooms = createAsyncThunk(
  'rooms/addRooms',
  async (data, { rejectWithValue }) => {
    try {
      const res = await axios.post('http://localhost:3001/rooms/create', data);

      if (res.status !== 200) {
        throw new Error('something went wrong');
      }

      return res.data;

    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

export const getRooms = createAsyncThunk(
  'rooms/getRooms',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get('http://localhost:3001/rooms');

      if (res.status !== 200) {
        throw new Error('something went wrong');
      }

      return res.data;

    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
)

export const renameRoom = createAsyncThunk(
  'rooms/renameRoom',
  async (data, { rejectWithValue }) => {
    try {
      const res = await axios.put('http://localhost:3001/rooms/changeName', data);

      if (res.status !== 200) {
        throw new Error('something went wrong');
      }

      return res.data;

    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
)

export const deleteRooms = createAsyncThunk(
  'rooms/deleteRooms',
  async ({ id }, { rejectWithValue }) => {
    try {
      const res = await axios.delete('http://localhost:3001/rooms/delete/' + id);

      if (res.status !== 200) {
        throw new Error('something went wrong');
      }

      return res.data;

    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
)

const roomsSlice = createSlice({
  name: 'rooms',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getRooms.pending, (state) => {
        state.loading = true;
        state.error = initError;

        return state;
      })
      .addCase(getRooms.fulfilled, (state, action) => {
        state.rooms = action.payload;
        state.loading = false;

        return state;
      })
      .addCase(getRooms.rejected, (state) => {
        state.error = {
          status: true,
          message: 'get rooms error'
        }
        state.loading = false;

        return state;
      })
  }
});

export default roomsSlice.reducer;
