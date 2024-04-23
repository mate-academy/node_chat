import { ChatType } from "../../../entities/Chat/types/chatTypes";
import { getUsers } from "../../../entities/User";
import { User } from "../../../entities/User/types/userTypes";

export const getPotentialChats
  = async (user: User | null, chats: ChatType[]) => {
    if (!user) return [];

    const users = await getUsers();
    const activeChats = chats.map(item => item.members);
    const flatedChats = activeChats.flat();
    const activeUsers = flatedChats.map(el => el.id);

    const potentialChats = users.filter(u => {
      if (u.id === user.id) return false;
      if (activeUsers.includes(u.id)) return false;

      return true;
    });

    return potentialChats;
  }