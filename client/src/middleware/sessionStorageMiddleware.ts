import { type Middleware } from 'redux';
import { type AuthState } from '../types/AuthState';
import { type ChatState } from '../types/ChatState';
import { accessSesionStorage } from '../utils/accessLocalStorage';
import { accessStorageKeys } from '../types/accessStorageKeys';

interface AppState {
  auth: AuthState;
  chatRooms: ChatState;
}

export const sessionStorageMiddleware: Middleware<
  Record<string, unknown>,
  AppState
> = (store) => (next) => (action) => {
  const result = next(action);
  const authState = store.getState().auth;
  const chatState = store.getState().chatRooms;

  accessSesionStorage.set(accessStorageKeys.LOGGED_IN, authState);
  accessSesionStorage.set(accessStorageKeys.CHAT_ROOMS, chatState);

  return result;
};
