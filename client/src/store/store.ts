import { combineSlices, configureStore } from '@reduxjs/toolkit';
import { messagesSlice, roomsSlice, currentRoomSlice } from './slices';

const rootReducer = combineSlices(messagesSlice, roomsSlice, currentRoomSlice);

export const store = configureStore({
  reducer: rootReducer,
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof rootReducer>;
