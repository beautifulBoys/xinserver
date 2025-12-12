

module.exports = (app) => {
  const { router, controller, config, middleware, } = app

  app.router.get('/', controller.web.indexhtml)
  // app.router.get('/config.js', controller.web.configjs)

}

