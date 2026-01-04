

const generateMessage = (username, text) => {
  return {
    username:username,
    text: text,
    createdAt: new Date().getTime(),
  };
};



module.exports = {
  generateMessage,

};
