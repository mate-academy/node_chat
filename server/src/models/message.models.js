const messagesList = [];

const addNewMessage = (text) => {
  let id;

  if (messagesList[messagesList.length - 1]) {
    id = messagesList[messagesList.length - 1].id + 1;
  } else {
    id = 1;
  }

  const newMessage = {
    id,
    text,
    createDate: new Date(Date.now()).toISOString(),
  };

  messagesList.push(newMessage);

  return newMessage;
};

const getAllMessages = () => {
  return messagesList;
};

module.exports = { addNewMessage, getAllMessages };
