/* eslint-env browser */
export const $ = (selector) => document.querySelector(selector);

let toastTimer = null;

export function toast(message) {
  const el = $('#toast');

  el.textContent = message;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 3500);
}

export const fail = (err) => toast(err.message);

export function formatTime(ts) {
  const d = new Date(ts);
  const hm = d.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  if (d.toDateString() === new Date().toDateString()) {
    return hm;
  }

  return (
    d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) +
    ' ' +
    hm
  );
}
