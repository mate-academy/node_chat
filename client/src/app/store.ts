import { configureStore } from '@reduxjs/toolkit';
import AuthSlice from '../features/authentication';
import chatRoomsSlice from '../features/chatRooms';
import { sessionStorageMiddleware } from '../middleware/sessionStorageMiddleware';
import { accessSesionStorage } from '../utils/accessLocalStorage';
import { accessStorageKeys } from '../types/accessStorageKeys';
import * as authActions from '../features/authentication';
import * as charActions from '../features/chatRooms';

const store = configureStore({
  reducer: {
    auth: AuthSlice,
    chatRooms: chatRoomsSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(sessionStorageMiddleware),
});

const storedAuthState = accessSesionStorage.get(accessStorageKeys.LOGGED_IN);
const storedChatState = accessSesionStorage.get(accessStorageKeys.CHAT_ROOMS);

if (storedChatState) {
  store.dispatch(charActions.actions.setCharFromSession(storedChatState));
}
if (storedAuthState) {
  store.dispatch(authActions.actions.setAuthFromSession(storedAuthState));
}

export default store;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
