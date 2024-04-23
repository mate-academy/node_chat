import { getUsers } from './api/getUsers';
import { removeUser, clearError } from './store/userSlice';
import { login } from './store/authThunks'

export {
  getUsers,
  removeUser,
  clearError,
  login,
}