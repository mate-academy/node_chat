export interface ResetPasswordResponse {
  status: number;
}

export interface AxiosErrorResponse {
  response?: {
    data?: {
      message?: string;
    };
  };
}
