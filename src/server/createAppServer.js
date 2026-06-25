'use strict';

const http = require('http');
const path = require('path');
const { URL: NodeURL } = require('url');

const { handleApi } = require('./router');
const { serveStatic } = require('./static');
const { createEventBus } = require('./events');
const { sendJson, setSecurityHeaders } = require('./http');
const { createChatStore } = require('../store/chatStore');

const publicDir = path.join(__dirname, '..', 'public');

const createAppServer = () => {
  const store = createChatStore();
  const eventBus = createEventBus(store);

  return http.createServer(async (req, res) => {
    const url = new NodeURL(req.url, `http://${req.headers.host}`);

    setSecurityHeaders(res);

    try {
      if (url.pathname === '/events') {
        eventBus.connect(req, res);

        return;
      }

      if (url.pathname.startsWith('/api/')) {
        await handleApi(req, res, url.pathname, store, eventBus);

        return;
      }

      await serveStatic(req, res, url.pathname, publicDir);
    } catch (error) {
      sendJson(res, error.statusCode || 500, { error: error.message });
    }
  });
};

module.exports = { createAppServer };
