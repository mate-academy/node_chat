export interface LoginCredentials {
  userName: string;
  password: string;
}

export interface LoginResponse {
  data: {
    token: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
  };
}
