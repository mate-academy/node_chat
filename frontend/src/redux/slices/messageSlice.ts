/* eslint-disable no-param-reassign */
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { RootState } from '../store.ts';
import { CreateMessageI, Message } from '../../types/message.ts';
import { createMessage, getAllMessage } from '../../api/message.ts';

export interface messageState {
  loaded: boolean;
  messages: Message[];
}

const initialState: messageState = {
  loaded: false,
  messages: [],
};

export const initMessage = createAsyncThunk('message/FETCH', () =>
  getAllMessage(),
);

export const initCreateMessage = createAsyncThunk(
  'messageCreate/FETCH',
  (data: CreateMessageI) => createMessage(data),
);

export const messageSlice = createSlice({
  name: 'rooms',
  initialState,
  reducers: {
    setMessage: (state, actions) => {
      state.messages = actions.payload;
    },
  },
  extraReducers(builder) {
    builder.addCase(initMessage.pending, (state) => {
      state.loaded = true;
    });
    builder.addCase(initMessage.fulfilled, (state, action) => {
      state.messages = action.payload;
      state.loaded = false;
    });
    builder.addCase(initMessage.rejected, (state) => {
      state.loaded = false;
    });
  },
});

export const { setMessage } = messageSlice.actions;

export const selectMessage = (state: RootState) => state.message;

export default messageSlice.reducer;
