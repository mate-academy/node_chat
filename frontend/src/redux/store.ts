import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import userSliceReducer from './slices/userSlice.ts';
import roomSliceReducer from './slices/roomSlice.ts';
import messageSliceReducer from './slices/messageSlice.ts';


export const store = configureStore({
  reducer: {
    users: userSliceReducer,
    rooms: roomSliceReducer,
    message: messageSliceReducer,
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;

/* eslint-disable @typescript-eslint/indent */
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
/* eslint-enable @typescript-eslint/indent */
