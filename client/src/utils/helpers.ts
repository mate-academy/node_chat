// returns a promise resolved after a given delay

// To have autocompletion and avoid mistypes
export type RequestMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';

/* eslint-disable @typescript-eslint/no-explicit-any */
export const BASE_URL = [
  'https://mate.academy/students-api',
  'http://localhost:3005',
  'https://node-todos-with-db.onrender.com',
][1];

export function wait(delay: number) {
  return new Promise(resolve => {
    setTimeout(resolve, delay);
  });
}
