const roomsListElement = document.getElementById('roomsList')
const chatForm = document.getElementById('chat-info')
const roomIdInput = document.getElementById('roomId')
const createRoomBtn = document.getElementById('create-btn')
const editRoomBtn = document.getElementById('edit-btn')
const userNameInput = document.getElementById('userName')

if (localStorage.getItem('userName')) {
  userNameInput.value = localStorage.getItem('userName')
}

getRoomNames()

function getRoomNames() {
  fetch('http://localhost:3005/rooms')
    .then((response) => {
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }

      return response.json();
    })
    .then((data) => {
      roomsListElement.innerHTML = ''
      if (data.length === 0) {
        showNoRoomsMessage()
      } else {
        data.forEach((room) => {
          addRoomItem(room)
        });
      }
    })
    .catch((error) => {
      console.error(
        'There was a problem with the fetch operation:',
        error,
      )
    })
}

chatForm.addEventListener('submit', (event) => {
  event.preventDefault()

  const userName = userNameInput.value.trim()
  const selectedRoom = document.querySelector(
    'input[name="roomId"]:checked',
  )

  if (!userName) {
    alert('Please enter a valid username.')

    return
  }

  localStorage.setItem('userName', userName)

  if (!selectedRoom) {
    alert('Please select a room.')

    return
  }

  chatForm.submit()
})

createRoomBtn.addEventListener('click', (event) => {
  event.preventDefault()

  const newRoom = prompt('Enter the room name:', 'Room name')

  if (newRoom && newRoom.trim() !== '') {
    fetch(`http://localhost:3005/rooms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: newRoom }),
    })
      .then((response) => {
        if (response.ok) {
          roomsListElement.innerHTML = ''
          getRoomNames();
        } else {
          throw new Error('Failed to create room')
        }
      })
      .catch((error) => {
        console.error('Error creating room:', error)
      })
  } else {
    alert('Room name cannot be empty!')
  }
})

editRoomBtn.addEventListener('click', (event) => {
  event.preventDefault()

  const rooms = document.querySelectorAll('.room-item')

  rooms.forEach((room) => {
    room.classList.toggle('edit')
  })
})

function showNoRoomsMessage() {
  const messageElement = document.createElement('li')
  messageElement.classList.add('no-rooms-message')
  messageElement.innerText = 'Now no room exists. Be brave to create a new one!'
  roomsListElement.appendChild(messageElement)
}

function addRoomItem(room) {
  const roomItem = document.createElement('li')
  roomItem.classList.add('room-item')

  const radio = document.createElement('input')
  radio.type = 'radio';
  radio.name = 'roomId';
  radio.id = `room-${room.id}`;
  radio.value = room.id;
  radio.setAttribute('hidden', true);

  const label = document.createElement('label')
  label.htmlFor = `room-${room.id}`
  label.innerText = room.name

  const renameBtn = document.createElement('button')
  renameBtn.innerText = 'Rename'
  renameBtn.className = 'rename-btn'

  renameBtn.addEventListener('click', (event) => {
    event.preventDefault()

    const newRoomName = prompt('Enter new room name:', room.name)

    if (newRoomName && newRoomName.trim() !== '') {
      fetch(`http://localhost:3005/rooms/${room.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newName: newRoomName }),
      })
        .then((response) => {
          if (response.ok) {
            label.innerText = newRoomName;
          } else {
            throw new Error('Failed to edit room')
          }
        })
        .catch((error) => {
          console.error('Error editing room:', error)
        })
    }
  })

  const deleteBtn = document.createElement('button')
  deleteBtn.innerText = 'Delete'
  deleteBtn.className = 'delete-btn'

  deleteBtn.addEventListener('click', (event) => {
    event.preventDefault()

    fetch(`http://localhost:3005/rooms/${room.id}`, {
      method: 'DELETE',
    })
      .then((response) => {
        if (response.ok) {
          roomItem.remove()
        } else {
          throw new Error('Failed to delete room')
        }
      })
      .catch((error) => {
        console.error('Error deleting room:', error)
      })
  })

  const divBtns = document.createElement('div')
  divBtns.classList.add('buttons')
  divBtns.appendChild(renameBtn)
  divBtns.appendChild(deleteBtn)

  roomItem.appendChild(radio)
  roomItem.appendChild(label)
  roomItem.appendChild(divBtns)
  roomsListElement.appendChild(roomItem)

  roomItem.addEventListener('click', () => {
    radio.checked = true
    highlightSelectedRoom(roomItem)
  });

  radio.addEventListener('change', () => {
    highlightSelectedRoom(roomItem)
  })
}

function highlightSelectedRoom(selectedRoomItem) {
  document.querySelectorAll('.room-item').forEach((item) => {
    item.classList.remove('selected')
  })

  selectedRoomItem.classList.add('selected')
}
