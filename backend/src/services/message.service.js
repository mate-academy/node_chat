const normalize = ({ id, text, authorId, createdAt, updatedAt }) => {
  return { id, text, authorId, updatedAt, createdAt };
};

const messageService = { normalize };

module.exports = messageService;
