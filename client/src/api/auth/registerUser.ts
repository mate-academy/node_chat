import api from '../api';

export function registerUser(
  userName: string,
  email: string,
  password: string,
  confirmPassword: string
) {
  return api.post('/api/registration', {
    userName,
    email,
    password,
    confirmPassword,
  });
}
