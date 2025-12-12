// 存项目配置信息


const CONFIG = {
  modelName: 'xin_option', // 模型名称
  tableName: '系统配置表', // 表名称
  ispublic: false, // 是否公开
}

module.exports = (app) => {

  const Schema = new app.mongoose.Schema({
    ...(app.xinMongo.createCommonBeforeFields(CONFIG)),

    type: {
      title: '分类。例如存储：多个配置属于同一类，可以用type作归类',
      type: String,
      trim: true,
    },
    key: {
      title: '键（类型:key = value）',
      type: String,
      trim: true,
    },
    value: {
      title: '值',
      type: app.mongoose.Schema.Types.Mixed,
    },

    ...(app.xinMongo.createCommonAfterFields(CONFIG)),
  },
  {
    ...(app.xinMongo.createCommonOptions(CONFIG)),
  })

  app.xinMongo.createCommonIndexs(CONFIG, Schema)
  Schema.index({ key: 1, }, { unique: true, })

  app.xinMongo.createCommonVirtuals(CONFIG, Schema)

  return app.mongoose.model(CONFIG.modelName, Schema, CONFIG.modelName)
}
