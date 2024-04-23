export type { Message } from './types/messageTypes';
import { send } from './store/thunks';
import { getAll, getUnread } from './store/thunks';
import { addMessage, readMessages, clearUnreadMessages } from './store/messagesSlice';
import { readAll } from './api/readAll';
import { readMessage } from './api/readMessage'

export {
  addMessage,
  readMessages,
  clearUnreadMessages,
  getAll,
  getUnread,
  send,
  readAll,
  readMessage,
}