module.exports = class MessageDto {
  roomId;
  author;
  text;
  createdAt;

  constructor(message) {
    this.roomId = message.roomId;
    this.author = message.author;
    this.text = message.text;
    this.createdAt = message.createdAt;
  }
};
