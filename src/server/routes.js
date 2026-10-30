const pages = require('../controllers/pages.controller');
const events = require('../controllers/events.controller');
const users = require('../controllers/users.controller');
const rooms = require('../controllers/rooms.controller');
const messages = require('../controllers/messages.controller');

/** [método, regex do caminho, handler]. Grupos da regex viram `params`. */
module.exports = [
  ['GET', /^\/$/, pages.index],
  ['GET', /^\/client\/(.+)$/, pages.clientAsset],
  ['GET', /^\/events$/, events.stream],

  ['POST', /^\/api\/username$/, users.register],

  ['POST', /^\/api\/rooms$/, rooms.create],
  ['PATCH', /^\/api\/rooms\/([\w-]+)$/, rooms.rename],
  ['DELETE', /^\/api\/rooms\/([\w-]+)$/, rooms.remove],

  ['GET', /^\/api\/rooms\/([\w-]+)\/messages$/, messages.history],
  ['POST', /^\/api\/rooms\/([\w-]+)\/messages$/, messages.send],
];
