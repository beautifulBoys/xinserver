

module.exports = (app) => {
  const { router, controller, config, middleware, } = app

  // 七牛云储存
  router.post('/plugin/qiniu/cdn_token', controller.plugin.qiniu.cdn_token)
 
  
}

