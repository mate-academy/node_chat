import { createSlice } from '@reduxjs/toolkit'
import { MessageState } from '../types/messageTypes';
import { getAll, getUnread, send } from './thunks'
import { handleGetAllResponse, handleGetUnreadResponse, handleSendResponse } from './services';

const initialState: MessageState = {
  messages: [],
  loading: false,
  error: '',
  newMessage: null,
  unreadMessages: [],
  unreadLoaging: false,
  unreadError: '',
}

export const messagesSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    addMessage: (state, action) => {
      state.messages = [...state.messages, action.payload];
    },
    readMessages: (state, action) => {
      const chatId = action.payload;

      state.unreadMessages = state.unreadMessages.filter(msg => {
        return msg.chatId !== chatId
      })

    },

    clearUnreadMessages: (state) => {
      state.unreadMessages = [];
    }
  },
  extraReducers: (builder) => {
    builder.addCase(getAll.pending, handleGetAllResponse);
    builder.addCase(getAll.fulfilled, handleGetAllResponse);
    builder.addCase(getAll.rejected, handleGetAllResponse);

    builder.addCase(getUnread.pending, handleGetUnreadResponse);
    builder.addCase(getUnread.fulfilled, handleGetUnreadResponse);
    builder.addCase(getUnread.rejected, handleGetUnreadResponse);

    builder.addCase(send.pending, handleSendResponse);
    builder.addCase(send.fulfilled, handleSendResponse);
    builder.addCase(send.rejected, handleSendResponse);
  }
})

export const { addMessage, readMessages, clearUnreadMessages } = messagesSlice.actions;
export default messagesSlice.reducer;



