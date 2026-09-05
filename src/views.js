'use strict';

function chatPage() {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Relay · Chat</title><link rel="stylesheet" href="/styles.css"></head>
<body><div class="app-shell"><aside><a class="brand" href="/"><span>R</span> Relay</a><div class="eyebrow">Conversation rooms <button id="create" aria-label="Create room">+</button></div><nav id="rooms" aria-label="Chat rooms"></nav><div class="account"><i id="avatar">?</i><div><strong id="username">Guest</strong><button id="change">Change username</button></div></div></aside>
<main class="chat-card"><header><div><p class="eyebrow">Current room</p><h1 id="title">Choose a room</h1><small id="info">Connect and start chatting</small></div><div class="tools"><button id="rename">Rename</button><button id="remove">Delete</button></div></header><section id="messages"><div class="empty"><b>Start the conversation</b><small>No messages yet. Say hello to the room.</small></div></section><form id="composer"><textarea id="text" maxlength="2000" placeholder="Write a message…" required></textarea><button>Send <span>→</span></button></form></main></div>
<dialog id="login"><form id="login-form"><p class="eyebrow">Join the conversation</p><h2>Welcome to Relay</h2><p>Choose the name people will see with your messages.</p><label>Username<input id="name" maxlength="32" autocomplete="nickname" required></label><button>Continue <span>→</span></button></form></dialog><div id="toast" role="status"></div><script src="/app.js"></script></body></html>`;
}

module.exports = { chatPage };
