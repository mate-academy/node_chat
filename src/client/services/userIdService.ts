const key = 'userId';

export const userIdService = {
  get: () => localStorage.getItem(key),
  save: (userId: number) => localStorage.setItem(key, userId + ''),
  remove: () => localStorage.removeItem(key),
};
