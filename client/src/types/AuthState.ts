export interface AuthState {
  isAuthenticated: boolean;
  user: UserAuthResp | undefined;
  accessToken: string | undefined;
}

interface UserAuthResp {
  id: number;
  email: string;
}
