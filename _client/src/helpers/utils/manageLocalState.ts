const key = 'userName';

export const getUserName = () => {
  const data = localStorage.getItem(key);

  if (!data) {
    return '';
  }

  try {
    return JSON.parse(data);
  } catch (e) {
    localStorage.removeItem(key);

    return '';
  }
};

export const saveUserName = (newUserName: string) => {
  localStorage.setItem(key, JSON.stringify(newUserName));
};
