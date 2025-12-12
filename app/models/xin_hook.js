// 系统信息表

const CONFIG = {
  modelName: 'xin_hook', // 模型名称
  tableName: 'Hook表', // 表名称
  ispublic: false, // 是否公开
}

module.exports = (app) => {

  const Schema = new app.mongoose.Schema({
    ...(app.xinMongo.createCommonBeforeFields(CONFIG)),
  
    type: {
      title: '类型',
      type: String,
      trim: true,
      ...(app.xinMongo.createEnumAttributes([
        { label: '唯一ID（每日累计）', value: 'unique_id', },
      ])),
    },
    unique_id: {
      title: '唯一ID（每日累计）',
      type: Number,
      default: 1,
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
