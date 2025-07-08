import { create } from 'zustand';
import {
  type User,
  type Chat,
  type Message,
  type UserChat,
} from '../types/types';
import api from '../api';

type UserStore = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  userChats: UserChat[];
  discoverableChats: Chat[];
  messages: Message[];
  selectedChat: Chat | null;
  isLoading: boolean;
  setUserAndToken: (user: User, token: string) => void;
  setUser: (userId: string | undefined) => void;
  setToken: (token: string) => void;
  logout: () => void;
  setSelectedChat: (chat: Chat | null) => void;
  fetchUserChats: () => Promise<void>;
  fetchDiscoverableChats: () => Promise<void>;
  fetchMessages: (chatId: string) => Promise<void>;
  addMessage: (message: Message) => void;
  createChat: (name: string) => Promise<void>;
  joinChat: (chatId: string) => Promise<void>;
  renameChat: (chatId: string, newName: string) => Promise<void>;
  delateChat: (chatId: string) => Promise<void>;
};

export const useUserStore = create<UserStore>((set, get) => ({
  user: null,
  token: (() => {
    try {
      return localStorage.getItem('accessToken');
    } catch {
      return null;
    }
  })(),
  isAuthenticated: (() => {
    try {
      return !!localStorage.getItem('accessToken');
    } catch {
      return false;
    }
  })(),
  userChats: [],
  discoverableChats: [],
  messages: [],
  selectedChat: null,
  isLoading: false,

  setUserAndToken: (user, token) => {
    try {
      localStorage.setItem('accessToken', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      set({ user, token, isAuthenticated: true });
    } catch (error) {
      console.error('Failed to set token:', error);
    }
  },
  setUser: async (userId) => {
    if (!userId) {
      console.error(`userId is undefined or null ${userId}`);
      return;
    }

    try {
      const user = await api.get(`/users/${userId}`);
      set({ user: user.data });
    } catch {
      console.error('Failed to set user');
    }
  },

  setToken: (token) => {
    try {
      localStorage.setItem('accessToken', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      set({ token, isAuthenticated: true });
    } catch (error) {
      console.error('Failed to set token:', error);
    }
  },

  logout: () => {
    try {
      localStorage.removeItem('accessToken');
      delete api.defaults.headers.common['Authorization'];
    } catch (error) {
      console.error('Failed to clear token:', error);
    }
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      userChats: [],
      discoverableChats: [],
      messages: [],
      selectedChat: null,
    });
  },

  setSelectedChat: (chat) => {
    const currentState = get();

    if (currentState.selectedChat?.id === chat?.id) {
      return;
    }

    set({ selectedChat: chat, messages: [] });

    if (chat) {
      setTimeout(() => {
        get().fetchMessages(chat.id);
      }, 0);
    }
  },

  fetchUserChats: async () => {
    const { isLoading } = get();
    if (isLoading) return;

    set({ isLoading: true });
    try {
      const { data } = await api.get('/chat/my-chats');
      set({ userChats: data });
    } catch (error) {
      console.error('Failed to fetch user chats', error);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchDiscoverableChats: async () => {
    try {
      const { data } = await api.get('/chat/discover');
      set({ discoverableChats: data });
    } catch (error) {
      console.error('Failed to fetch discoverable chats', error);
    }
  },

  fetchMessages: async (chatId) => {
    try {
      const { data } = await api.get(`/chat/messages/${chatId}`);

      const currentState = get();
      if (currentState.selectedChat?.id === chatId) {
        set({ messages: data });
      }
    } catch (error) {
      console.error('Failed to fetch messages', error);
    }
  },

  addMessage: (message) => {
    const currentState = get();

    if (currentState.selectedChat?.id === message.chatId) {
      const messageExists = currentState.messages.some(
        (msg) => msg.id === message.id,
      );

      if (!messageExists) {
        set((state) => ({
          messages: [...state.messages, message],
        }));
      }
    }
  },

  createChat: async (name) => {
    try {
      await api.post('/chat/create', { name });

      await get().fetchUserChats();
      await get().fetchDiscoverableChats();
    } catch (error) {
      console.error('Failed to create chat:', error);
      throw error;
    }
  },

  joinChat: async (chatId) => {
    try {
      await api.post(`/chat/join/${chatId}`);

      await get().fetchUserChats();
      await get().fetchDiscoverableChats();
    } catch (error) {
      console.error('Failed to join chat:', error);
      throw error;
    }
  },

  renameChat: async (chatId, newName) => {
    try {
      const { data: updatedChat } = await api.patch(`/chat/rename/${chatId}`, {
        newName,
      });

      set((state) => ({
        userChats: state.userChats.map((userChat) =>
          userChat.chatId === chatId
            ? { ...userChat, chat: updatedChat }
            : userChat,
        ),
        selectedChat:
          state.selectedChat?.id === chatId ? updatedChat : state.selectedChat,
      }));
    } catch (error) {
      console.error('Failed to rename chat:', error);
      throw error;
    }
  },
  delateChat: async (chatId) => {
    try {
      await api.delete(`/chat/delete/${chatId}`);

      set((state) => ({
        userChats: state.userChats.filter(
          (userChat) => userChat.chatId !== chatId,
        ),
        discoverableChats: state.discoverableChats.filter(
          (chat) => chat.id !== chatId,
        ),
        selectedChat:
          state.selectedChat?.id === chatId ? null : state.selectedChat,
      }));

    } catch (error) {
      console.error('Failed to delete chat:', error);
      throw error;
    }
  },
}));
