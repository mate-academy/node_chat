const ws = new WebSocket('ws://localhost:3005')

const chatForm = document.getElementById('chat-form')
const chatMessages = document.querySelector('.chat-messages')
const charRoomName = document.getElementById('room-name')
const userList = document.getElementById('users')

const params = new URLSearchParams(window.location.search)

const roomId = params.get('roomId')
const userName = params.get('userName')

ws.addEventListener('open', () => {
  console.log('Connected to WebSocket server')
  ws.send(JSON.stringify({ type: 'joinRoom', roomId, userName }))
})

ws.addEventListener('message', (event) => {
  try {
    const data = JSON.parse(event.data).data;

    if (!data.userName || !data.text) {
      console.error('Missing message fields:', data)

      return
    }

    outputMessage(data)

    if (data.roomName) {
      outputRoomName(data.roomName)
    }

    if (data.roomUsers) {
      outputUserList(data.roomUsers)
    }

    chatMessages.scrollTop = chatMessages.scrollHeight
  } catch (error) {
    console.error('Error parsing message:', error)
  }
})

chatForm.addEventListener('submit', (e) => {
  e.preventDefault()

  const msg = e.target.elements.msg.value

  if (msg.trim() === '') {
    console.log('Message cannot be empty')

    return
  }

  if (isNaN(Number(roomId))) {
    console.log('Valid room ID is required')

    return
  }

  if (!userName) {
    console.log('User name required')

    return;
  }

  // emit message to server
  sendMessage(roomId, userName, msg)

  e.target.elements.msg.value = ''
  e.target.elements.msg.focus()
})

const sendMessage = (roomId, userName, message) => {
  if (ws.readyState === WebSocket.OPEN) {
    const data = {
      type: 'newMessage',
      roomId,
      userName,
      message,
    }

    ws.send(JSON.stringify(data))
  } else {
    console.log('WebSocket is not open. Ready state:', ws.readyState)
  }
}

function outputMessage(data) {
  const div = document.createElement('div')

  if (userName === data.userName) {
    div.classList.add('message', 'own')
  } else {
    div.classList.add('message')
  }

  div.innerHTML = `
    <p class="meta">${data.userName} <span>${data.time}</span></p>
    <p class="text">
      ${data.text}
    </p>
  `
  chatMessages.appendChild(div)
}

function outputRoomName(room) {
  charRoomName.innerText = room
}

function outputUserList(users) {
  userList.innerHTML = `
  ${users.map(user => `
    <li class="${user.userName === userName ? 'current-user' : ''}">
      ${user.userName}
    </li>
  `).join('')}
`;
}
