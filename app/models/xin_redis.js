

const CONFIG = {
  modelName: 'xin_redis', // 模型名称
  tableName: 'Redis表', // 表名称
  ispublic: false, // 是否公开
}

module.exports = (app) => {

  const Schema = new app.mongoose.Schema({
    ...(app.xinMongo.createCommonBeforeFields(CONFIG)),

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
