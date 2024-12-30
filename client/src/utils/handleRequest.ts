import { isAxiosError } from 'axios';

export const handleRequest = async <T>(request: Promise<T>): Promise<T> => {
  try {
    return await request;
  } catch (err) {
    if (isAxiosError(err) && err.response && typeof err.response.data.message === 'string') {
      throw err.response.data.message;
    }
    throw 'An unexpected error occurred';
  }
};
