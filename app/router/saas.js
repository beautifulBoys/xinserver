

module.exports = (app) => {
  const { router, controller, config, middleware, } = app

  // 应用
  // router.post('/saas/app/list', controller.saas.app.list)

  // 我的应用
  router.post('/saas/myapp/list', controller.saas.myapp.list)
  router.post('/saas/myapp/userApplist', controller.saas.myapp.userApplist)
  router.post('/saas/myapp/freelist', controller.saas.myapp.freelist)
  router.post('/saas/myapp/marketlist', controller.saas.myapp.marketlist)
  router.post('/saas/myapp/exchange_search', controller.saas.myapp.exchange_search)
  router.post('/saas/myapp/exchange', controller.saas.myapp.exchange)
  router.post('/saas/myapp/shiyong', controller.saas.myapp.shiyong)
  router.post('/saas/myapp/add', controller.saas.myapp.add)
  router.post('/saas/myapp/detail', controller.saas.myapp.detail)
  router.post('/saas/myapp/update', controller.saas.myapp.update)
  router.post('/saas/myapp/delete', controller.saas.myapp.delete)

  // 我的插件
  router.post('/saas/myplugin/list', controller.saas.myplugin.list)
  router.post('/saas/myplugin/add', controller.saas.myplugin.add)
  router.post('/saas/myplugin/detail', controller.saas.myplugin.detail)
  router.post('/saas/myplugin/update', controller.saas.myplugin.update)
  router.post('/saas/myplugin/batchUpdate', controller.saas.myplugin.batchUpdate)
  router.post('/saas/myplugin/delete', controller.saas.myplugin.delete)
  
  // 我的授权
  router.post('/saas/mylicense/use', controller.saas.mylicense.use)
  router.post('/saas/mylicense/detail', controller.saas.mylicense.detail)
  router.post('/saas/mylicense/update', controller.saas.mylicense.update)
  router.post('/saas/mylicense/updateLicense', controller.saas.mylicense.updateLicense)
  

  // 订单相关
  router.post('/saas/order/list', controller.saas.order.list)

  // 应用市场相关
  router.post('/saas/market/screen_shiyong', controller.saas.market.screen_shiyong)
  router.post('/saas/market/table_shiyong', controller.saas.market.table_shiyong)
  router.post('/saas/market/block_shiyong', controller.saas.market.block_shiyong)
  router.post('/saas/market/plugin_shiyong', controller.saas.market.plugin_shiyong)
  
}

