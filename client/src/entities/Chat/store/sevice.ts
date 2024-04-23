import { FETCH_USER_CHATS } from "../consts/storeConsts";
import { ChatState } from "../types/chatTypes";

export const handleHttpResponse = (state: ChatState, action: any) => {
  switch (action.type) {
    case FETCH_USER_CHATS.pending:
      state.error = '';
      state.loading = true;
      break;

    case FETCH_USER_CHATS.fulfilled:
      state.loading = false;
      state.chats = action.payload;
      break;

    case FETCH_USER_CHATS.rejected:
      state.loading = false;
      state.error = action.error.message;
      break;

    default:
      break;
  }
};
