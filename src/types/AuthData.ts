import { NormalizedUser } from './NormalizedUser';

export interface AuthData {
  accessToken: string;
  refreshToken: string;
  normalizedUser: NormalizedUser;
}
