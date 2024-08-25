import { useState } from 'react';

export const useLocalStorage = <T>(
  key: string,
  defaultValue: T | null = null,
): [T | null, (newValue: T | null) => void] => {
  const [storedValue, setStoredValue] = useState<T | null>(() => {
    try {
      const value = window.localStorage.getItem(key);
      return value ? (JSON.parse(value) as T) : defaultValue;
    } catch (err) {
      console.error(`Error reading from localStorage for key ${key}:`, err);
      return defaultValue;
    }
  });

  const setValue = (newValue: T | null) => {
    try {
      if (newValue === null) {
        window.localStorage.removeItem(key);
      } else {
        window.localStorage.setItem(key, JSON.stringify(newValue));
      }
      setStoredValue(newValue);
    } catch (err) {
      console.error(`Error writing to localStorage for key ${key}:`, err);
    }
  };

  return [storedValue, setValue];
};
