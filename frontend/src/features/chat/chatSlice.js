import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

const initError = {
  status: false,
  message: ''
};

const initialState = {
  chat: [],
  room: null,
  loading: false,
  error: initError,
};

export const getChat = createAsyncThunk(
  'rooms/getChat',
  async (idRoom, { rejectWithValue }) => {
    try {
      const res = await axios.get('http://localhost:3001/chat/' + idRoom);

      if (res.status !== 200) {
        throw new Error('something went wrong');
      }

      return res.data;

    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
)

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addMessage: (state, action) => {
      state.chat.push(action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getChat.fulfilled, (state, action) => {
        state.chat = action.payload;
      })
  }
});

export const { addMessage } = chatSlice.actions;

export default chatSlice.reducer;
