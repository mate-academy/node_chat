/* eslint-env browser */
import { $ } from './utils.js';
import { initUsername } from './components/username.js';
import { initNewRoomForm } from './components/roomList.js';
import { initComposer } from './components/composer.js';
import { onRoomCreated, sendMessage } from './chat.js';
import { connect } from './realtime.js';

initUsername();
initNewRoomForm(onRoomCreated);
initComposer(sendMessage);

$('#toggleSide').addEventListener('click', () => {
  document.body.classList.toggle('side-open');
});

connect();
