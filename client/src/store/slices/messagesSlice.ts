import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Message } from '../../types/message';

interface MessagesState {
  messages: Message[];
}

const initialState: MessagesState = {
  messages: [],
};

export const messagesSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    setMessages: (state, action: PayloadAction<Message[]>) => {
      state.messages = action.payload;
    },

    addMessage: (state, action: PayloadAction<Message>) => {
      state.messages.push(action.payload);
    },

    clearMessages: (state) => {
      state.messages = [];
    },
  },
});

export const { setMessages, addMessage, clearMessages } = messagesSlice.actions;
