import { combineReducers } from '@reduxjs/toolkit';
import userReduser from '../features/user/userSlice';
import roomsReduser from '../features/rooms/roomsSlice';
import chatReduser from '../features/chat/chatSlice';


const rootReducer = combineReducers({
  user: userReduser,
  rooms: roomsReduser,
  chat: chatReduser
});

export default rootReducer;
