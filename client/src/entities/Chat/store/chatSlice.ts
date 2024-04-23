import { createSlice } from '@reduxjs/toolkit'
import { ChatState } from '..';
import { getChats } from './thunks/fetchUserChats';
import { handleHttpResponse } from './sevice';

const initialState: ChatState = {
  chats: [],
  currentChat: null,
  loading: false,
  error: '',
}

export const chatsSlice = createSlice({
  name: 'chats',
  initialState,
  reducers: {
    setCurrentChat: (state, action) => {
      state.currentChat = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder.addCase(getChats.pending, handleHttpResponse)
    builder.addCase(getChats.fulfilled, handleHttpResponse)
    builder.addCase(getChats.rejected, handleHttpResponse)
  }
})

export const { setCurrentChat } = chatsSlice.actions;
export default chatsSlice.reducer;

