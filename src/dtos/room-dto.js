module.exports = class RoomDto {
  name;
  id;
  message;

  constructor(model) {
    this.name = model.name;
    this.id = model.id;
    this.message = model.message;
  }
};
