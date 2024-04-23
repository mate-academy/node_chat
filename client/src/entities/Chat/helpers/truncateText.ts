export const truncateText = (text: string) => {
  let shortText = text.substring(0, 20);

  if (text.length > 20) {
    shortText = shortText + '...'
  }

  return shortText;
}