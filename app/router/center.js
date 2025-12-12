

module.exports = (app) => {
  const { router, controller, config, middleware, } = app

  // 查询官方应用中心-数据表
  router.post('/center/market/table_list', controller.center.market.table_list)
  router.post('/center/market/table_update', controller.center.market.table_update)
  router.post('/center/market/table_install', controller.center.market.table_install)

  // 查询官方应用中心-数据字典表
  router.post('/center/market/dictionary_list', controller.center.market.dictionary_list)
  router.post('/center/market/dictionary_update', controller.center.market.dictionary_update)
  router.post('/center/market/dictionary_install', controller.center.market.dictionary_install)

  // 查询官方应用中心-用户标签
  router.post('/center/market/usertag_list', controller.center.market.usertag_list)
  router.post('/center/market/usertag_update', controller.center.market.usertag_update)
  router.post('/center/market/usertag_install', controller.center.market.usertag_install)

  // 查询官方应用中心-插件
  // router.post('/center/market/plugin_list', controller.center.market.plugin_list)
  // router.post('/center/market/plugin_update', controller.center.market.plugin_update)

}

