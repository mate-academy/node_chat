function appendMessage({ author, text, time }, currentUsername) {
  const messages = document.getElementById('messages');
  const messageElement = document.createElement('div');
  const isMyMessage = author === currentUsername;
  const formattedTime = new Date(time).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  messageElement.className = `flex flex-col ${isMyMessage ? 'items-end' : 'items-start'}`;

  messageElement.innerHTML = `
    <div class="max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${isMyMessage ? 'bg-indigo-500 rounded-br-none' : 'bg-gray-600 rounded-bl-none'}">
      <div class="flex items-baseline space-x-2">
        <p class="font-bold text-sm ${isMyMessage ? 'text-white' : 'text-blue-300'}">${isMyMessage ? 'You' : author}</p>
        <p class="text-xs text-gray-300">${formattedTime}</p>
      </div>
      <p class="text-white">${text}</p>
    </div>
  `;

  messages.appendChild(messageElement);
  messages.scrollTop = messages.scrollHeight;
}

function appendSystemMessage(text) {
  const messages = document.getElementById('messages');
  const systemMessageElement = document.createElement('div');

  systemMessageElement.className = 'text-center my-2';
  systemMessageElement.innerHTML = `<p class="system-message text-sm">${text}</p>`;

  messages.appendChild(systemMessageElement);
  messages.scrollTop = messages.scrollHeight;
}

export { appendMessage, appendSystemMessage };
