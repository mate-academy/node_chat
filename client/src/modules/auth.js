/* eslint-env browser */

const USER_LOGIN_EVENT = 'user:login';
const LOCAL_STORAGE_KEY = 'chat_username';

export function initAuth(socket) {
  const authScreen = document.getElementById('auth-screen');
  const chatScreen = document.getElementById('chat-screen');
  const authForm = document.getElementById('auth-form');
  const usernameInput = document.getElementById('username-input');

  // Функція перемикання екранів після успішного входу
  const handleSuccessLogin = (username) => {
    authScreen.classList.add('hidden');
    chatScreen.classList.remove('hidden');

    // Відправляємо подію на сервер, що користувач увійшов
    socket.emit(USER_LOGIN_EVENT, username);
  };

  // 1. Перевірка localStorage при завантаженні сторінки
  const savedUsername = localStorage.getItem(LOCAL_STORAGE_KEY);

  if (savedUsername) {
    handleSuccessLogin(savedUsername);

    return;
  }

  // 2. Обробка сабміту форми, якщо імені в стореджі немає
  authForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const username = usernameInput.value.trim();

    if (!username) {
      return;
    }

    // Зберігаємо в localStorage
    localStorage.setItem(LOCAL_STORAGE_KEY, username);

    // Активуємо екран чату та сповіщаємо сервер
    handleSuccessLogin(username);
  });
}
