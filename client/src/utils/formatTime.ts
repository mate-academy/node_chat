export const formatTime = (isoString: string) => {
  const date = new Date(isoString);

  return date.toLocaleTimeString('uk-UA', {
    hour: '2-digit',
    minute: '2-digit',
  });
};
