/**
 * mobile.js — Menu responsivo da sidebar.
 *
 * Responsabilidades:
 * - Abrir/fechar sidebar em telas pequenas
 * - Controlar overlay de fundo
 *
 * @module mobile
 */

/* eslint-env browser */

const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');

/**
 * Fecha a sidebar mobile e o overlay.
 */
export function closeMobileSidebar() {
  sidebar.classList.remove('open');
  sidebarOverlay.classList.remove('open');
}

/**
 * Inicializa os event listeners do menu mobile.
 * Chamado uma única vez pelo app.js na inicialização.
 */
export function initMobileHandlers() {
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');

  mobileMenuBtn.addEventListener('click', () => {
    sidebar.classList.toggle('open');
    sidebarOverlay.classList.toggle('open');
  });

  sidebarOverlay.addEventListener('click', closeMobileSidebar);
}
