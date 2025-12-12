

module.exports = (app) => {
  const { router, controller, config, middleware, } = app

  // 自定义接口
  router.post('/customapi/*', controller.business.customapi.customapi)
  router.get('/customapi/*', controller.business.customapi.customapi)

  // 自定义接口测试
  router.post('/customapiTest/*', controller.business.customapi.customapiTest)

}

