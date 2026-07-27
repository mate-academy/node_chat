import React, { createContext, useMemo, useState, ReactNode } from 'react';
import { authService } from '../api/auth';
import { User } from '../types/User';
import { userService } from '../api/users';

interface LoginData {
  email: string;
  password: string;
}

interface AuthContextType {
  isChecked: boolean;
  currentUser: User | null;
  checkAuth: () => Promise<void>;
  activate: (activationToken: string) => Promise<void>;
  login: (data: LoginData) => Promise<void>;
  logout: () => Promise<void>;
  updateUsername: (id: string, username: string) => Promise<void>;
  updatePassword: (
    id: string,
    oldPass: string,
    newPass: string,
  ) => Promise<void>;
  updateEmail: (
    id: string,
    password: string,
    newEmail: string,
  ) => Promise<void>;
  confirmEmail: (token: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
}

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthContext = createContext<AuthContextType>(
  {} as AuthContextType,
);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isChecked, setChecked] = useState(false);

  async function activate(activationToken: string) {
    const { user } = await authService.activate(activationToken);

    setCurrentUser(user);
  }

  async function checkAuth() {
    try {
      const { user } = await authService.refresh();

      setCurrentUser(user);
    } catch {
      // eslint-disable-next-line no-console
      console.log('User is not authenticated');
    } finally {
      setChecked(true);
    }
  }

  async function login({ email, password }: LoginData) {
    const { user } = await authService.login({ email, password });

    setCurrentUser(user);
  }

  async function logout(): Promise<void> {
    await authService.logout();
    setCurrentUser(null);
  }

  async function updateUsername(id: string, username: string) {
    const user = await userService.updateUsername(id, username);

    setCurrentUser(user);
  }

  async function updatePassword(
    id: string,
    oldPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await userService.updatePassword(id, oldPassword, newPassword);

    setCurrentUser(user);
  }

  async function updateEmail(
    id: string,
    password: string,
    newEmail: string,
  ): Promise<void> {
    const user = await userService.updateEmail(id, password, newEmail);

    setCurrentUser(user);
  }

  async function confirmEmail(token: string) {
    const user = await userService.confirmEmail(token);

    setCurrentUser(user);
  }

  async function forgotPassword(email: string) {
    await authService.forgotPassword(email);
  }

  async function resetPassword(token: string, password: string) {
    await authService.resetPassword(token, password);
  }

  const value = useMemo<AuthContextType>(
    () => ({
      isChecked,
      currentUser,
      checkAuth,
      activate,
      login,
      logout,
      updateUsername,
      updatePassword,
      updateEmail,
      confirmEmail,
      forgotPassword,
      resetPassword,
    }),
    [currentUser, isChecked],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
