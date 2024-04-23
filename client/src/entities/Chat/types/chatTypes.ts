import { Message } from "../../Message";
import { User } from "../../User/types/userTypes";

type ChatState = {
  chats: ChatType[];
  currentChat: ChatType | null;
  loading: boolean;
  error: string;
}

type ChatType = {
  id: number;
  unread: boolean,
  members: Member[];
  lastMessage: Message;
};

type Member = {
  id: number,
  name: string,
}

type ChatRequestType = {
  id: string;
  name: string;
  owner: string;
}

type CreateChatRequest = {
  firstId: number,
  secondId: number,
}

type PotentialChat = Omit<User, "accessToken">;

export type { ChatState, ChatType, ChatRequestType, CreateChatRequest, PotentialChat, Member };
