

module.exports = (app) => {
  const { router, controller, config, middleware, } = app

  // 平台版
  // 用户登录
  router.post('/platform/login', controller.platform.account.login)
  router.post('/platform/user_project_list', controller.platform.account.user_project_list)
  
  // router.post('/platform/register', controller.platform.account.register)
  router.post('/platform/create_token', controller.platform.account.create_token)
  router.post('/platform/user', controller.platform.account.user)
  router.post('/platform/initProject', controller.platform.account.initProject)
  // router.post('/platform/initZoneProject', controller.platform.account.initZoneProject)
  router.post('/platform/joinProject', controller.platform.account.joinProject)

  // 空间版
  router.post('/platform/createProject', controller.platform.account.createProject)

  
}

