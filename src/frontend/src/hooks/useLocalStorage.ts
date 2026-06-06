import { useEffect, useState } from 'react';

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): readonly [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState(() => {
    try {
      const savedValue = localStorage.getItem(key);

      return savedValue === null ? initialValue : JSON.parse(savedValue);
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Failed to save to localStorage', error);
    }
  }, [key, value]);

  return [value, setValue] as const;
}
