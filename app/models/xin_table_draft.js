

const CONFIG = {
  modelName: 'xin_table_draft', // 模型名称
  tableName: '数据表草稿表', // 表名称
  ispublic: false, // 是否公开
}

module.exports = (app) => {

  const Schema = new app.mongoose.Schema({
    ...(app.xinMongo.createCommonBeforeFields(CONFIG)),

    table_id: {
      title: '数据表ID',
      type: app.mongoose.Schema.Types.ObjectId,
    },
    fields: {
      title: '表字段',
      type: Array,
    },

    ...(app.xinMongo.createCommonAfterFields(CONFIG)),
  },
  {
    ...(app.xinMongo.createCommonOptions(CONFIG)),
  })

  app.xinMongo.createCommonIndexs(CONFIG, Schema)
  Schema.index({ table_id: 1, })

  app.xinMongo.createCommonVirtuals(CONFIG, Schema)

  Schema.virtual('tableInfo', {
    ref: 'xin_table',
    localField: 'table_id',
    foreignField: '_id',
    justOne: true,
  })

  return app.mongoose.model(CONFIG.modelName, Schema, CONFIG.modelName)
}
