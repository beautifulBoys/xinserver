

const CONFIG = {
  modelName: 'xin_devtool_db_log', // 模型名称
  tableName: '数据表执行日志表', // 表名称
  ispublic: false, // 是否公开
}

module.exports = (app) => {

  const Schema = new app.mongoose.Schema({
    ...(app.xinMongo.createCommonBeforeFields(CONFIG)),
  
    script: {
      title: '脚本',
      type: String,
      trim: true,
    },
    result: {
      title: '执行结果',
      type: app.mongoose.Schema.Types.Mixed,
    },

    ...(app.xinMongo.createCommonAfterFields(CONFIG)),
  },
  {
    ...(app.xinMongo.createCommonOptions(CONFIG)),
  })

  app.xinMongo.createCommonIndexs(CONFIG, Schema)

  app.xinMongo.createCommonVirtuals(CONFIG, Schema)

  return app.mongoose.model(CONFIG.modelName, Schema, CONFIG.modelName)
}
