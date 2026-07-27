import { authClient } from '../http/authClient.js';
import { User } from '../types/User.js';

interface Credentials {
  email: string;
  username: string;
  password: string;
}

interface AuthResponse {
  user: User;
}

async function register({ email, username, password }: Credentials) {
  const data = await authClient.post('/register', {
    email,
    username,
    password,
  });

  return data;
}

async function login({ email, password }: Omit<Credentials, 'username'>) {
  const data = await authClient.post<AuthResponse>('/login', {
    email,
    password,
  });

  return data;
}

async function logout() {
  const data = await authClient.post('/logout');

  return data;
}

async function activate(activationToken: string) {
  const data = await authClient.get<AuthResponse>(
    `/activate/${activationToken}`,
  );

  return data;
}

async function refresh() {
  const data = await authClient.get<AuthResponse>('/refresh');

  return data;
}

async function forgotPassword(email: string) {
  return authClient.post('/forgot-password', {
    email,
  });
}

async function resetPassword(token: string, password: string) {
  const data = await authClient.post(`/reset-password/${token}`, {
    password,
  });

  return data;
}

export const authService = {
  register,
  login,
  logout,
  activate,
  refresh,
  forgotPassword,
  resetPassword,
};
