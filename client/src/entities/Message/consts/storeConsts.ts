const MESSAGE_SEND = {
  main: 'message/send',
  pending: 'message/send/pending',
  rejected: 'message/send/rejected',
  fulfilled: 'message/send/fulfilled',
};

const MESSAGES_FETCH = {
  main: 'messages/fetch',
  pending: 'messages/fetch/pending',
  rejected: 'messages/fetch/rejected',
  fulfilled: 'messages/fetch/fulfilled',
};

const MESSAGES_UNREAD = {
  main: 'messages/unread',
  pending: 'messages/unread/pending',
  rejected: 'messages/unread/rejected',
  fulfilled: 'messages/unread/fulfilled',
};

export {
  MESSAGE_SEND,
  MESSAGES_FETCH,
  MESSAGES_UNREAD,
}