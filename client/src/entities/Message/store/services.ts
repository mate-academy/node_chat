import { MESSAGES_FETCH, MESSAGES_UNREAD, MESSAGE_SEND } from "../consts/storeConsts";
import { MessageState } from "../types/messageTypes";

const handleSendResponse = (state: MessageState, action: any) => {
  switch (action.type) {
    case MESSAGE_SEND.pending:
      // state.loading = true;
      break;
    case MESSAGE_SEND.fulfilled:
      state.loading = false;
      state.messages = [...state.messages, action.payload];
      state.newMessage = action.payload;
      break;
    case MESSAGE_SEND.rejected:
      state.loading = false;
      state.error = `Error: ${action.error.message}`;
      break;
    default: break;
  }
}

const handleGetAllResponse = (state: MessageState, action: any) => {
  switch (action.type) {
    case MESSAGES_FETCH.pending:
      state.loading = true;
      break;
    case MESSAGES_FETCH.fulfilled:
      state.loading = false;
      state.messages = action.payload;
      break;
    case MESSAGES_FETCH.rejected:
      state.loading = false;
      state.error = `Error: ${action.error.message}`;
      break;
    default: break;
  }
}
const handleGetUnreadResponse = (state: MessageState, action: any) => {
  switch (action.type) {
    case MESSAGES_UNREAD.pending:
      state.unreadLoaging = true;
      break;
    case MESSAGES_UNREAD.fulfilled:
      state.unreadLoaging = false;
      state.unreadMessages = action.payload;
      break;
    case MESSAGES_UNREAD.rejected:
      state.unreadLoaging = false;
      state.unreadError = `Error: ${action.error.message}`;
      break;
    default: break;
  }
}

export {
  handleGetAllResponse,
  handleSendResponse,
  handleGetUnreadResponse,
}