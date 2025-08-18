import fs from 'fs';

const path = 'messages.json';

function saveMessageToJson(newMessage) {
  fs.readFile(path, 'utf8', (err, data) => {
    let messages = [];

    if (!err && data) {
      try {
        messages = JSON.parse(data);
      } catch (e) {
        throw e;
      }
    }

    messages.push(newMessage);

    fs.writeFile(path, JSON.stringify(messages, null, 2), (e) => {
      if (e) {
        throw e;
      }
    });
  });
}

function getAllMessages(roomId) {
  return new Promise((resolve, reject) => {
    fs.readFile(path, 'utf8', (err, data) => {
      if (err) {
        reject(err);
      }

      const messages = JSON.parse(data);

      resolve(messages.filter((message) => String(message.roomId) === roomId));
    });
  });
}

export const messagesApi = {
  saveMessageToJson,
  getAllMessages,
};
