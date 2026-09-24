export function createRoomElement(room) {
  const roomContainer = document.createElement('div');
  roomContainer.className = 'room-container';

  const newButton = document.createElement('button');
  newButton.dataset.room = room;
  newButton.textContent = room;

  const renameButton = document.createElement('button');
  renameButton.dataset.rename = 'rename';
  renameButton.textContent = 'rename';

  const deleteButton = document.createElement('button');
  deleteButton.dataset.delete = 'delete';
  deleteButton.textContent = 'delete';

  roomContainer.appendChild(newButton);
  roomContainer.appendChild(renameButton);
  roomContainer.appendChild(deleteButton);
  return roomContainer;
}

