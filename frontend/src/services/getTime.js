export function getTime(time) {
  const dateObj = new Date(Date(time));

  return dateObj.toLocaleDateString('en-US');
}
