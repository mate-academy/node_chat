export function send(ws, data) {
  ws.send(JSON.stringify(data));
}
