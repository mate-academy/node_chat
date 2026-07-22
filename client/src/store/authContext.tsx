import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { User } from "../utils/types";
import { authApi } from "../api/authApi";
import { clientApi } from "../api/clientApi";

type authContextType = {
  user: User | null;
  isLoading: boolean;
  isChecked: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createUser: (username: any) => Promise<void>;
};

const authContext = createContext<authContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isChecked, setIsChecked] = useState(false);

  const createUser = async (username: string) => {
    // eslint-disable-next-line no-useless-catch
    try {
      const res = await clientApi.createUser(username, Math.random() * 100);
      setUser(res.data);
      localStorage.setItem("accessToken", res.data.accessToken);
      localStorage.setItem("username", res.data.username);
    } catch (e) {
      throw e;
    }
  };

  useEffect(() => {
    authApi
      .getMe()
      .then((res) => {
        setUser(res.data);
      })
      .finally(() => {
        setIsChecked(true);
        setIsLoading(false);
      });
  }, []);

  return (
    <authContext.Provider value={{ user, isLoading, isChecked, createUser }}>
      {children}
    </authContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(authContext);

  if (!context) {
    throw new Error("useauth must be used within authProvider");
  }

  return context;
}

