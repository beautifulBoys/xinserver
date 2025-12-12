// 官方服务

module.exports = (app) => {
  const { router, controller, config, middleware, } = app

  // 应用
  router.post('/official/app/list', controller.official.app.list)
  router.post('/official/app/update', controller.official.app.update)
  // 可视化
  router.post('/official/screen/list', controller.official.screen.list)
  router.post('/official/screen/detail', controller.official.screen.detail)
  router.post('/official/screen/update', controller.official.screen.update)
  // 数据表
  router.post('/official/table/list', controller.official.table.list)
  router.post('/official/table/detail', controller.official.table.detail)
  router.post('/official/table/update', controller.official.table.update)
  // 组件
  router.post('/official/block/list', controller.official.block.list)
  router.post('/official/block/detail', controller.official.block.detail)
  router.post('/official/block/update', controller.official.block.update)
  // 插件
  router.post('/official/plugin/list', controller.official.plugin.list)
  router.post('/official/plugin/detail', controller.official.plugin.detail)
  router.post('/official/plugin/update', controller.official.plugin.update)
  // 连接器
  router.post('/official/connector/list', controller.official.connector.list)
  // router.post('/official/connector/detail', controller.official.connector.detail)
  router.post('/official/connector/update', controller.official.connector.update)
  // 自定义接口
  router.post('/official/customapi/list', controller.official.customapi.list)
  // router.post('/official/customapi/detail', controller.official.customapi.detail)
  router.post('/official/customapi/update', controller.official.customapi.update)

  
}

