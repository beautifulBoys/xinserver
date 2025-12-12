

const CONFIG = {
  modelName: 'xin_warning', // 模型名称
  tableName: '告警表', // 表名称
  ispublic: false, // 是否公开
}

module.exports = (app) => {

  const Schema = new app.mongoose.Schema({
    ...(app.xinMongo.createCommonBeforeFields(CONFIG)),

    table_id: {
      title: '数据表ID',
      type: app.mongoose.Schema.Types.ObjectId,
    },
    table_record_id: {
      title: '数据记录ID',
      type: app.mongoose.Schema.Types.ObjectId,
    },
    type: {
      title: '类型。举例：table_record_warning',
      type: String,
      trim: true,
    },
    type_scene: {
      title: '场景。举例：update',
      type: String,
      trim: true,
    },
    name: {
      title: '名称',
      type: String,
      trim: true,
    },
    description: {
      title: '描述',
      type: String,
      trim: true,
    },
    level: {
      title: '级别',
      type: Array,
    },
    body: {
      title: '内容',
      type: app.mongoose.Schema.Types.Mixed,
    },
    state: {
      title: '告警状态',
      type: Number,
      ...(app.xinMongo.createEnumAttributes([
        { label: '告警待处理', value: 0, },
        { label: '已确认', value: 1, },
        { label: '删除', value: 2, },
      ])),
      default: 0,
    },
    create_user_token: {
      title: '用户TOKEN',
      type: String,
      trim: true,
    },

    ...(app.xinMongo.createCommonAfterFields(CONFIG)),
  },
  {
    ...(app.xinMongo.createCommonOptions(CONFIG)),
  })

  app.xinMongo.createCommonIndexs(CONFIG, Schema)
  Schema.index({ table_id: 1, })
  Schema.index({ table_record_id: 1, })
  Schema.index({ type: 1, })
  Schema.index({ state: 1, })

  app.xinMongo.createCommonVirtuals(CONFIG, Schema)

  Schema.virtual('tableInfo', {
    ref: 'xin_table',
    localField: 'table_id',
    foreignField: '_id',
    justOne: true,
  })

  return app.mongoose.model(CONFIG.modelName, Schema, CONFIG.modelName)
}
