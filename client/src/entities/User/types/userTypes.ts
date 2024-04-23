export type User = {
  name: string,
  id: number,
  email: string;
  accessToken: string;
}

export type UserState = {
  user: User | null,
  accessToken: string,
  loading: boolean;
  error: string;
}