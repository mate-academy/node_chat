

const generateMessage = (text) => {
  return {
    text: text,
    // username: username,
    createdAt: new Date().getTime(),
  };
};



module.exports = {
  generateMessage,

};
