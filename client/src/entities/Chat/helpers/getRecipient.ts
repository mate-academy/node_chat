import { User } from "../../User/types/userTypes";
import { ChatType, Member } from "../types/chatTypes";

export const getRecipient = (chat: ChatType, user: User | null): Member | null => {
  if (user) {
    return chat.members.find(el => el.id !== user.id) || null;
  }

  return null;
}