import api from '../api';

export function setNewPassword(
  password: string,
  confirmPassword: string,
  resetToken: string
) {
  return api.post(`/api/password-reset/${resetToken}`, {
    password,
    confirmPassword,
  });
}
