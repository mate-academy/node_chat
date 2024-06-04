export const catchSocketError = (action, socket) => {
  return async (payload) => {
    try {
      await action(payload, socket);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error);
      socket.emit('error', 'Socket handler error');
    }
  };
};
