import React, { Dispatch, SetStateAction } from 'react';

import { usePageError } from '../hooks/usePageError';

const ErrorContext = React.createContext({
  error: '',
  setError: (() => {}) as Dispatch<SetStateAction<string>>,
});

export const ErrorProvider = ({ children }: { children: React.ReactNode }) => {
  const [error, setError] = usePageError('');

  const value = { error, setError };

  return (
    <ErrorContext.Provider value={value}>{children}</ErrorContext.Provider>
  );
};

export const useError = () => React.useContext(ErrorContext);
