export function formatTime(time) {
  const date = new Date(time);

  return `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
};


