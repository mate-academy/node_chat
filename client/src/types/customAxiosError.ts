import { type AxiosError } from 'axios';

interface ErrorData {
  errors?: Record<string, any>;
  message?: string;
}

export interface CustomAxiosError extends AxiosError<ErrorData> {}
