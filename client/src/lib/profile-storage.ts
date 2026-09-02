import type { ChatProfile } from '@/types/chat';

const PROFILE_STORAGE_KEY = 'node-chat-session-profile';
const LEGACY_PROFILE_STORAGE_KEY = 'node-chat-profile';
const PROFILE_CHANGED_EVENT = 'node-chat-profile-changed';

export function saveChatProfile(profile: ChatProfile) {
  sessionStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
  localStorage.removeItem(LEGACY_PROFILE_STORAGE_KEY);

  window.dispatchEvent(new Event(PROFILE_CHANGED_EVENT));
}

export function getProfileSnapshot() {
  return sessionStorage.getItem(PROFILE_STORAGE_KEY);
}

export function getServerProfileSnapshot() {
  return null;
}

export function subscribeToProfile(callback: () => void) {
  window.addEventListener(PROFILE_CHANGED_EVENT, callback);

  return () => {
    window.removeEventListener(PROFILE_CHANGED_EVENT, callback);
  };
}

export function parseChatProfile(value: string | null): ChatProfile | null {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as ChatProfile;
  } catch {
    return null;
  }
}

export function clearChatProfile() {
  sessionStorage.removeItem(PROFILE_STORAGE_KEY);
  localStorage.removeItem(LEGACY_PROFILE_STORAGE_KEY);

  window.dispatchEvent(new Event(PROFILE_CHANGED_EVENT));
}
