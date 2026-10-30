/* eslint-env browser */
import { $, fail } from '../utils.js';

/** `send(text)` retorna uma Promise; se falhar, o texto volta ao campo. */
export function initComposer(send) {
  $('#composer').addEventListener('submit', async (e) => {
    e.preventDefault();

    const input = $('#composerInput');
    const text = input.value.trim();

    if (!text) {
      return;
    }
    input.value = '';

    try {
      await send(text);
    } catch (err) {
      input.value = text;
      fail(err);
    }
  });
}
