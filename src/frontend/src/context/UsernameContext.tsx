import { createContext, useMemo } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

type UsernameContextType = {
  username: string | null;
  setUsername: React.Dispatch<React.SetStateAction<string | null>>;
  usernameId: number | null;
  setUsernameId: React.Dispatch<React.SetStateAction<number | null>>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const UsernameContext = createContext<UsernameContextType>({
  username: null,
  setUsername: () => {},
  usernameId: null,
  setUsernameId: () => {},
});

type Props = {
  children: React.ReactNode;
};

export const UsernameProvider: React.FC<Props> = ({ children }) => {
  const [username, setUsername] = useLocalStorage<string | null>(
    'username',
    null,
  );

  const [usernameId, setUsernameId] = useLocalStorage<number | null>(
    'usernameId',
    null,
  );
  const value = useMemo(
    () => ({
      username,
      setUsername,
      usernameId,
      setUsernameId,
    }),
    [username, setUsername, usernameId, setUsernameId],
  );

  return (
    <UsernameContext.Provider value={value}>
      {children}
    </UsernameContext.Provider>
  );
};
