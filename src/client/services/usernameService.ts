const key = 'username';

export const usernameService = {
  get: () => localStorage.getItem(key),
  save: (username: string) => localStorage.setItem(key, username),
  remove: () => localStorage.removeItem(key),
};
