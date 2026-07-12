export const createMessage = (author, text) => {
  return {
    author,
    text,
    time: new Date().toISOString(),
  };
};
