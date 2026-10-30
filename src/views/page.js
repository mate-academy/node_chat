const styles = require('./styles');
const markup = require('./markup');

/** Monta a página. O JS do cliente vem de /client/main.js (módulos ES). */
module.exports = function renderPage() {
  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Chat</title>
<style>${styles}</style>
</head>
<body>
${markup}
<script type="module" src="/client/main.js"></script>
</body>
</html>`;
};
