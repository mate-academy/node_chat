module.exports = class UserDto {
  name;
  id;

  constructor(model) {
    this.name = model.name;
    this.id = model.id;
  }
};
