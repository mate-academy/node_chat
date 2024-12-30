const addZeroToTime = (time: number) => {
  return time < 10 ? `0${time}` : time;
};

export const getDate = (date: Date) => {
  const _date = new Date(date);

  const day = addZeroToTime(_date.getDay());
  const month = addZeroToTime(_date.getMonth());
  const year = `${_date.getFullYear()}`.slice(2);

  return `${day}.${month}.${year}`;
};

export const geTime = (date: Date) => {
  const _date = new Date(date);

  const hour = addZeroToTime(_date.getHours());
  const minutes = addZeroToTime(_date.getMinutes());

  return `${hour}:${minutes} `;
};
