const chatRoutes = require('./chatRoutes.js');
const roomsRoutes = require('./roomsRouter.js');
const userRoutes = require('./userRoutes.js')

function routesApp(app) {
  app.use('/user', userRoutes)
  app.use('/rooms', roomsRoutes)
  app.use('/chat', chatRoutes)
}

module.exports = routesApp;
