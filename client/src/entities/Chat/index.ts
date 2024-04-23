import { getChats } from './store/thunks/fetchUserChats';
import { Chat } from '../Chat/components/Chat';
import { setCurrentChat } from './store/chatSlice';
import { create } from './api/create';
import { getRecipient } from './helpers/getRecipient'
export * from './types/chatTypes';

export {
  getChats,
  Chat,
  setCurrentChat,
  getRecipient,
  create,
};