/** Estrutura HTML do <body>, exportada como string (sem templates .ejs). */
module.exports = `
<div id="gate" class="gate" hidden>
  <form id="gateForm">
    <h1>Qual é o seu nome?</h1>
    <p>Ele aparecerá em todas as mensagens que você enviar.</p>
    <input
      id="gateInput"
      maxlength="24"
      autocomplete="nickname"
      aria-label="Nome de usuário"
      required
    />
    <button type="submit">Entrar no chat</button>
    <p class="error" id="gateError" role="alert"></p>
  </form>
</div>

<div class="app">
  <aside id="side">
    <div class="me">
      <strong id="meName"></strong>
      <button class="link" id="changeName" type="button">Trocar nome</button>
    </div>
    <h2>Salas</h2>
    <ul id="rooms"></ul>
    <form id="newRoom">
      <input
        id="newRoomName"
        maxlength="30"
        placeholder="Nome da nova sala"
        aria-label="Nome da nova sala"
      />
      <button type="submit">Criar</button>
    </form>
  </aside>

  <main>
    <header>
      <button id="toggleSide" type="button">Salas</button>
      <h2 id="roomTitle"></h2>
      <span id="status" hidden>Reconectando…</span>
    </header>
    <div id="messages" role="log" aria-live="polite"></div>
    <form id="composer" autocomplete="off">
      <input id="composerInput" maxlength="2000" aria-label="Mensagem" />
      <button type="submit">Enviar</button>
    </form>
  </main>
</div>

<div id="toast" role="status"></div>
`;
