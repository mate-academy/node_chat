import { configureStore } from '@reduxjs/toolkit';

import userReduser from '../../entities/User/store/userSlice'
import messagesReduser from '../../entities/Message/store/messagesSlice'
import chatsReduser from '../../entities/Chat/store/chatSlice'
import { socketReduser } from '../../entities/Socket'

export const store = configureStore({
  reducer: {
    user: userReduser,
    messages: messagesReduser,
    chats: chatsReduser,
    socket: socketReduser,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
