/* eslint-env browser */
import { $ } from './utils.js';
import { setRooms, receiveMessage } from './chat.js';

export function connect() {
  const es = new EventSource('/events');

  es.addEventListener('open', () => {
    $('#status').hidden = true;
  });

  es.addEventListener('error', () => {
    $('#status').hidden = false;
  });

  // Chega ao conectar (e ao reconectar): lista de salas + recarrega o histórico
  es.addEventListener('init', (e) => {
    setRooms(JSON.parse(e.data).rooms, true);
  });

  es.addEventListener('rooms', (e) => {
    setRooms(JSON.parse(e.data).rooms, false);
  });

  es.addEventListener('message', (e) => {
    receiveMessage(JSON.parse(e.data));
  });
}
