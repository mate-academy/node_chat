/** CSS da aplicação, exportado como string (sem arquivos .css). */
module.exports = `
:root {
  --bg: #e9eef2;
  --panel: #f8fafb;
  --ink: #17212b;
  --muted: #5e6e7c;
  --line: #d2dbe2;
  --side: #1b2733;
  --side-ink: #dde6ed;
  --side-muted: #8ca0b1;
  --side-active: #2b3d4e;
  --accent: #1f6f8b;
  --own: #d5e7ee;
}
* {
  box-sizing: border-box;
}
html,
body {
  height: 100%;
  margin: 0;
}
body {
  font:
    15px/1.45 system-ui,
    -apple-system,
    "Segoe UI",
    Roboto,
    sans-serif;
  color: var(--ink);
  background: var(--bg);
}
button,
input {
  font: inherit;
  color: inherit;
}
button {
  cursor: pointer;
}
:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

.app {
  display: grid;
  grid-template-columns: 270px 1fr;
  height: 100dvh;
}

aside {
  background: var(--side);
  color: var(--side-ink);
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 16px;
  min-height: 0;
}
aside :focus-visible {
  outline-color: #8fd0e6;
}
.me {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.me strong {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 16px;
}
.link {
  background: none;
  border: 0;
  padding: 2px 4px;
  color: var(--side-muted);
  text-decoration: underline;
  font-size: 13px;
}
.link:hover {
  color: var(--side-ink);
}
aside h2 {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  color: var(--side-muted);
}

#rooms {
  list-style: none;
  margin: 0;
  padding: 0;
  overflow-y: auto;
  flex: 1;
  min-height: 0;
}
#rooms li {
  display: flex;
  align-items: center;
  border-radius: 6px;
}
#rooms li.active {
  background: var(--side-active);
}
#rooms li:hover:not(.active) {
  background: rgba(255, 255, 255, 0.06);
}
#rooms .join {
  flex: 1;
  min-width: 0;
  text-align: left;
  background: none;
  border: 0;
  padding: 8px 10px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
#rooms li.active .join {
  font-weight: 600;
}
#rooms .act {
  background: none;
  border: 0;
  padding: 6px 7px;
  font-size: 12px;
  color: var(--side-muted);
}
#rooms .act:hover {
  color: #fff;
}

#newRoom {
  display: flex;
  gap: 6px;
}
#newRoom input {
  flex: 1;
  min-width: 0;
  padding: 8px 10px;
  border-radius: 6px;
  border: 1px solid #3a4c5d;
  background: #223140;
  color: var(--side-ink);
}
#newRoom input::placeholder {
  color: var(--side-muted);
}
#newRoom button {
  padding: 8px 12px;
  border-radius: 6px;
  border: 0;
  background: var(--side-ink);
  color: var(--side);
  font-weight: 600;
}

main {
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  background: var(--panel);
}
header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  border-bottom: 1px solid var(--line);
}
header h2 {
  margin: 0;
  font-size: 18px;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
#toggleSide {
  display: none;
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid var(--line);
  background: #fff;
}
#status {
  font-size: 13px;
  color: #a24b1a;
}
#status[hidden] {
  display: none;
}

#messages {
  flex: 1;
  overflow-y: auto;
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 0;
}
.empty {
  margin: auto;
  color: var(--muted);
}
.msg {
  max-width: min(640px, 85%);
  padding: 8px 12px;
  border-radius: 10px;
  background: #fff;
  border: 1px solid var(--line);
  align-self: flex-start;
}
.msg.own {
  align-self: flex-end;
  background: var(--own);
  border-color: #b9d4de;
}
.meta {
  display: flex;
  gap: 10px;
  align-items: baseline;
  font-size: 13px;
  margin-bottom: 2px;
}
.meta .author {
  font-weight: 600;
}
.meta time {
  color: var(--muted);
  font-size: 12px;
}
.text {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

#composer {
  display: flex;
  gap: 8px;
  padding: 14px 20px;
  border-top: 1px solid var(--line);
}
#composer input {
  flex: 1;
  min-width: 0;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid var(--line);
  background: #fff;
}
#composer button,
.gate button {
  padding: 10px 18px;
  border-radius: 8px;
  border: 0;
  background: var(--accent);
  color: #fff;
  font-weight: 600;
}

.gate {
  position: fixed;
  inset: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(23, 33, 43, 0.65);
}
.gate[hidden] {
  display: none;
}
.gate form {
  width: min(380px, 100%);
  background: var(--panel);
  border-radius: 12px;
  padding: 24px;
  display: grid;
  gap: 12px;
}
.gate h1 {
  margin: 0;
  font-size: 22px;
}
.gate p {
  margin: 0;
  color: var(--muted);
}
.gate input {
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid var(--line);
  background: #fff;
}
.gate .error {
  color: #a3261a;
  min-height: 1.4em;
}

#toast {
  position: fixed;
  left: 50%;
  bottom: 80px;
  transform: translateX(-50%);
  background: var(--ink);
  color: #fff;
  padding: 10px 16px;
  border-radius: 8px;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s;
  max-width: 90%;
  z-index: 20;
}
#toast.show {
  opacity: 1;
}

@media (max-width: 700px) {
  .app {
    grid-template-columns: 1fr;
  }
  aside {
    position: fixed;
    inset: 0 25% 0 0;
    z-index: 5;
    transform: translateX(-100%);
    transition: transform 0.2s;
  }
  body.side-open aside {
    transform: none;
  }
  #toggleSide {
    display: block;
  }
  .msg {
    max-width: 92%;
  }
}
@media (prefers-reduced-motion: reduce) {
  aside,
  #toast {
    transition: none;
  }
}
`;
