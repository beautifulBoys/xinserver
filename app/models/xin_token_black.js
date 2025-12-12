

const CONFIG = {
  modelName: 'xin_token_black', // 模型名称
  tableName: '授权黑名单表', // 表名称
  ispublic: false, // 是否公开
}

module.exports = (app) => {

  const Schema = new app.mongoose.Schema({
    ...(app.xinMongo.createCommonBeforeFields(CONFIG)),

    token: {
      title: 'Token',
      type: String,
    },

    ...(app.xinMongo.createCommonAfterFields(CONFIG)),
  },
  {
    ...(app.xinMongo.createCommonOptions(CONFIG)),
  })

  app.xinMongo.createCommonIndexs(CONFIG, Schema)
  Schema.index({ token: 1, })

  app.xinMongo.createCommonVirtuals(CONFIG, Schema)

  return app.mongoose.model(CONFIG.modelName, Schema, CONFIG.modelName)
}
