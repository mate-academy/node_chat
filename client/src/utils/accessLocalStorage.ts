import { type accessStorageKeys } from '../types/accessStorageKeys';

export const accessSesionStorage = {
  get(key: accessStorageKeys) {
    const data = localStorage.getItem(key);

    try {
      return data ? JSON.parse(data) : undefined;
    } catch {
      return undefined;
    }
  },

  set(key: accessStorageKeys, data: unknown) {
    try {
      localStorage.setItem(key, JSON.stringify(data));

      return this.get(key);
    } catch {
      return undefined;
    }
  },

  clearKey(key: accessStorageKeys) {
    localStorage.removeItem(key);
  },
};
