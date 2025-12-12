

const CONFIG = {
  modelName: 'xin_table_record', // 模型名称
  tableName: '数据表记录表', // 表名称
  ispublic: false, // 是否公开
}

module.exports = (app) => {

  const Schema = new app.mongoose.Schema({
    ...(app.xinMongo.createCommonBeforeFields(CONFIG)),

    table_id: {
      title: '数据表ID',
      type: app.mongoose.Schema.Types.ObjectId,
    },
    values: {
      title: '字段值',
      type: app.mongoose.Schema.Types.Mixed,
    },
    app_project_id: { // Saas 模式的时候，记录数据是项目下哪个应用记录的。
      title: 'SaaSApp ID',
      type: app.mongoose.Schema.Types.ObjectId,
    },

    ...(app.xinMongo.createCommonAfterFields(CONFIG)),
  },
  {
    ...(app.xinMongo.createCommonOptions(CONFIG)),
  })

  app.xinMongo.createCommonIndexs(CONFIG, Schema)
  Schema.index({ table_id: 1, })
  Schema.index({ unique_id: 1, })
  Schema.index({ type: 1, })

  app.xinMongo.createCommonVirtuals(CONFIG, Schema)


  Schema.virtual('tableInfo', {
    ref: 'xin_table',
    localField: 'table_id',
    foreignField: '_id',
    justOne: true,
  })

  Schema.virtual('appProjectInfo', {
    ref: 'xin_project',
    localField: 'app_project_id',
    foreignField: '_id',
    justOne: true,
  })

  return app.mongoose.model(CONFIG.modelName, Schema, CONFIG.modelName)
}
