

const CONFIG = {
  modelName: 'xin_ai_record', // 模型名称
  tableName: 'AI记录表', // 表名称
  ispublic: false, // 是否公开
}

module.exports = (app) => {

  const Schema = new app.mongoose.Schema({
    ...(app.xinMongo.createCommonBeforeFields(CONFIG)),

    ai: {
      title: 'AI',
      type: String,
      trim: true,
      default: 'deepseek',
    },
    model: {
      title: '模型',
      trim: true,
      type: String,
    },
    tokens: {
      title: 'Tokens',
      type: Number,
      default: 0,
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
