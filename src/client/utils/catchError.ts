import { AxiosError } from 'axios';

export interface ErrorResponse {
  message: string;
  status: number;
  errors?: Record<string, unknown>;
}

export const catchError = (
  error: AxiosError<ErrorResponse>,
  setError: (errorMessage: string) => void,
) => {
  if (!error.response?.data) {
    return;
  }

  const { message } = error.response.data;

  if (message) {
    setError(message);
  }
};
