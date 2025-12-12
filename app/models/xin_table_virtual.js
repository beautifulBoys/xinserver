

const CONFIG = {
  modelName: 'xin_table_virtual', // 模型名称
  tableName: '数据表虚拟字段表', // 表名称
  ispublic: false, // 是否公开
}

module.exports = (app) => {

  const Schema = new app.mongoose.Schema({
    ...(app.xinMongo.createCommonBeforeFields(CONFIG)),

    table_id: {
      title: '数据表ID',
      type: app.mongoose.Schema.Types.ObjectId,
    },
    name: {
      title: '虚拟字段名',
      type: String,
      trim: true,
    },
    current_table: {
      title: '当前表',
      type: app.mongoose.Schema.Types.ObjectId,
    },
    local_field: {
      title: '当前表字段',
      type: String,
      trim: true,
    },
    ref: {
      title: '关联表',
      type: app.mongoose.Schema.Types.ObjectId,
    },
    foreign_field: {
      title: '关联表字段',
      type: String,
      trim: true,
    },
    just_one: {
      title: '单记录',
      type: Boolean,
      default: true,
    },
    count: {
      title: '数量',
      type: Boolean,
      default: false,
    },

    ...(app.xinMongo.createCommonAfterFields(CONFIG)),
  },
  {
    ...(app.xinMongo.createCommonOptions(CONFIG)),
  })

  app.xinMongo.createCommonIndexs(CONFIG, Schema)
  Schema.index({ group_id: 1, })
  Schema.index({ type: 1, })

  app.xinMongo.createCommonVirtuals(CONFIG, Schema)

  Schema.virtual('currentTableInfo', {
    ref: 'xin_table',
    localField: 'current_table',
    foreignField: '_id',
    justOne: true,
  })

  Schema.virtual('refTableInfo', {
    ref: 'xin_table',
    localField: 'ref',
    foreignField: '_id',
    justOne: true,
  })

  return app.mongoose.model(CONFIG.modelName, Schema, CONFIG.modelName)
}
