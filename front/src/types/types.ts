export interface Message {
  id: number;
  text: string;
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

export type WSNewChat = WSEvent<'NewChat', Chat>;

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
