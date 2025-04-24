import api from '../api';

export function sendResetPassword(email: string) {
  return api.post('/api/password-reset', {
    email,
  });
}
