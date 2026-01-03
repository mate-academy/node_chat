
const socket = io();


const $messageForm = document.querySelector('#message-form');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');

const $messages = document.querySelector('#messages');



const messageTemplate = document.querySelector('#message-template').innerHTML;

const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;


// eslint-disable-next-line no-restricted-globals, no-undef
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const autoScroll = () => {

  const $newMessage = $messages.lastElementChild;


  const newMessageStyle = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyle.marginBottom);
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;


  const visibleHeight = $messages.offsetHeight;


  const containerHeight = $messages.scrollHeight;


  const scrollOffset = $messages.scrollTop + visibleHeight;

  if (containerHeight - newMessageHeight <= scrollOffset) {
    $messages.scrollTop = $messages.scrollHeight;
  }
};



socket.on('message', (message) => {

  // eslint-disable-next-line no-undef
  const html = Mustache.render(messageTemplate, {
    username: message.username,
    message: message.text,
    // eslint-disable-next-line no-undef
    createdAt: moment(message.createdAt).format('h:mm a'),
  });
  $messages.insertAdjacentHTML('beforeend', html);
  autoScroll();
});



socket.on('roomData', ({ room, users }) => {
  // eslint-disable-next-line no-undef
  const html = Mustache.render(sidebarTemplate, {
    room: room,
    users: users,
  });
  document.querySelector('#sidebar').innerHTML = html;
});

$messageForm.addEventListener('submit', (e) => {
  e.preventDefault();


  $messageFormButton.setAttribute('disabled', 'disabled');



  const message = $messageFormInput.value;

  if (message === '') {

    $messageFormButton.removeAttribute('disabled');
    return;
  }
  socket.emit('sendMessage', message, (error) => {

    $messageFormButton.removeAttribute('disabled');

    $messageFormInput.value = '';

    $messageFormInput.focus();
    if (error) {
      return console.log(error);
    }

  });
});



socket.emit('join', { username, room }, (error) => {
  if (error) {
    alert(error);

  }
});


