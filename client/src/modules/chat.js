/* eslint-env browser */

const ROOM_HISTORY_EVENT = 'room:history';
const MESSAGE_SEND_EVENT = 'message:send';
const MESSAGE_NEW_EVENT = 'message:new';

const formatTime = (isoString) => {
  const date = new Date(isoString);

  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export function initChat(socket) {
  const messagesList = document.getElementById('messages-list');
  const messageForm = document.getElementById('message-form');
  const messageInput = document.getElementById('message-input');

  let currentRoomId = null;

  // Функція малювання одного повідомлення
  const appendMessage = (message) => {
    const div = document.createElement('div');

    div.className = 'message';

    div.innerHTML = `
      <div class="message__header">
        <span class="message__author">${message.author}</span>
        <span class="message__time">${formatTime(message.time)}</span>
      </div>
      <div class="message__text">${message.text}</div>
    `;

    messagesList.appendChild(div);

    // Автоскрол донизу
    messagesList.scrollTop = messagesList.scrollHeight;
  };

  // 1. Отримання історії при вході (разом із ID кімнати)
  socket.on(ROOM_HISTORY_EVENT, ({ roomId, messages }) => {
    currentRoomId = roomId;
    messagesList.innerHTML = ''; // Очищаємо екран

    messages.forEach(appendMessage);

    // Показуємо форму вводу тексту
    messageForm.classList.remove('hidden');
  });

  // 2. Отримання нового повідомлення (live)
  socket.on(MESSAGE_NEW_EVENT, (message) => {
    appendMessage(message);
  });

  // 3. Відправка повідомлення
  messageForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const text = messageInput.value.trim();

    if (!text || !currentRoomId) {
      return;
    }

    socket.emit(MESSAGE_SEND_EVENT, { roomId: currentRoomId, text });

    messageInput.value = ''; // Очищаємо інпут після відправки
  });
}
