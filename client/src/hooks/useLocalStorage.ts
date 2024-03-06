import * as R from "react";

export function useLocalStorage<T>(key: string, initialValue: T)
  : [T, (newV: T) => void] {
  const [value, setValue] = R.useState<T>(() => {
    try {
      return JSON.parse(localStorage.getItem(key) as string);
    } catch {
      return initialValue;
    }
  });

  return [
    value,
    (newV: T) => {
      setValue(newV);
      localStorage.setItem(key, JSON.stringify(newV));
    },
  ];
};
