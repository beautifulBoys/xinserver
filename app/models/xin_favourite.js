

const CONFIG = {
  modelName: 'xin_favourite', // 模型名称
  tableName: '收藏表', // 表名称
  ispublic: false, // 是否公开
}

module.exports = (app) => {

  const Schema = new app.mongoose.Schema({
    ...(app.xinMongo.createCommonBeforeFields(CONFIG)),
  
    type: {
      title: '类型',
      type: String,
      trim: true,
    },
    target_id: {
      title: '目标ID',
      type: app.mongoose.Schema.Types.ObjectId,
    },

    ...(app.xinMongo.createCommonAfterFields(CONFIG)),
  },
  {
    ...(app.xinMongo.createCommonOptions(CONFIG)),
  })

  app.xinMongo.createCommonIndexs(CONFIG, Schema)
  Schema.index({ type: 1, target_id: 1, create_user_id: 1, }, { unique: true, })
  Schema.index({ target_id: 1, })

  app.xinMongo.createCommonVirtuals(CONFIG, Schema)

  return app.mongoose.model(CONFIG.modelName, Schema, CONFIG.modelName)
}
