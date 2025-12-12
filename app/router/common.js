

module.exports = (app) => {
  const { router, controller, config, middleware, } = app

  // 数据库方法
  router.post('/db/model', controller.db.index.model)
  router.post('/db/aggregate', controller.db.index.aggregate)
  router.post('/db/aggregate1', controller.db.index.aggregate1)

  // 公共接口
  // 上传
  router.post('/common/uploadFile', controller.common.file.uploadFile)
  router.post('/common/uploadLicense', controller.common.file.uploadLicense)
  // 获取唯一ID
  router.post('/common/get_unique_id', controller.common.hook.get_unique_id)
  router.post('/common/get_id', controller.common.hook.get_id)
  
  // 免鉴权接口
  router.post('/common/noauth', controller.common.noauth.main)


  // 开发工具
  router.post('/devtool/db/script', controller.devtool.db.script)
  router.post('/devtool/dbRecord/list', controller.devtool.dbRecord.list)
  router.post('/devtool/dbRecord/add', controller.devtool.dbRecord.add)
  router.post('/devtool/dbRecord/update', controller.devtool.dbRecord.update)
  router.post('/devtool/dbRecord/detail', controller.devtool.dbRecord.detail)
  router.post('/devtool/dbRecord/delete', controller.devtool.dbRecord.delete)


}

