export enum ErrorType {
  NoError = '',
  LoadMessagesError = 'Unable to load messages',
  AddMessageError = 'Unable to add a message',
  UpdateMessageError = 'Unable to update a message',
  DeleteMessageError = 'Unable to delete a message',
  LoadRoomsError = 'Unable to load rooms',
  AddRoomError = 'Unable to add a room',
  UpdateRoomError = 'Unable to update a room',
  DeleteRoomError = 'Unable to delete a room',
  EmptyTitleError = 'Title should not be empty',
}
