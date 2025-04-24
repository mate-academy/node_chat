import api from '../api';

export const getUserData = (
  userId: number | undefined,
  accessToken: string | undefined
) => {
  return api.get(`/api/user/${userId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });
};

export const getUserByIdBulk = (ids: number[]) => {
  return api.get(`/api/user/byids`, {
    params: { ids: JSON.stringify(ids) },
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
