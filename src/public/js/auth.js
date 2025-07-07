function initializeAuth(state) {
  const usernameModal = document.getElementById('username-modal');
  const usernameForm = document.getElementById('username-form');
  const usernameInput = document.getElementById('username-input');
  const displayUsername = document.getElementById('display-username');
  const chatContainer = document.getElementById('chat-container');

  if (state.username) {
    showChatInterface();
  }

  usernameForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const newUsername = usernameInput.value.trim();

    if (newUsername) {
      state.username = newUsername;
      window.localStorage.setItem('chat_username', state.username);
      showChatInterface();
    }
  });

  function showChatInterface() {
    displayUsername.textContent = state.username;
    usernameModal.classList.add('hidden');
    chatContainer.classList.remove('hidden');
    chatContainer.classList.add('flex');
    state.socket.emit('set username', state.username);
  }
}

export { initializeAuth };
