export interface Message {
  id: number;
  text: string;
  createdAt: string;
  UserId: number;
  ChatId: number;
}

export interface MessageWithAuthor {
  message: Message;
  author: string;
}

export interface WSEvent<T, K> {
  type: T;
  payload: K;
}

export type WSMessage = WSEvent<'new_message', MessageWithAuthor>;

export type WSUpdatedMessage = WSEvent<'updated_message', Message>;

export type WSDeleteMessage = WSEvent<'delete_message', {messageId: number, chatId: number}>;

export type WSNewChat = WSEvent<'new_chat', Chat>;

export type WSChatRenamed = WSEvent<'chat_renamed', Chat>;

export type WSChatDeleted = WSEvent<'chat_deleted', number>;

export interface Chat {
  id: number;
  name: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface NormalizedUserList {
  id: number;
  name: string;
}
