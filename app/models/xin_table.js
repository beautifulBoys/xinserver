

const CONFIG = {
  modelName: 'xin_table', // 模型名称
  tableName: '数据表', // 表名称
  ispublic: false, // 是否公开
}

module.exports = (app) => {

  const Schema = new app.mongoose.Schema({
    ...(app.xinMongo.createCommonBeforeFields(CONFIG)),

    group_id: {
      title: '分组ID',
      type: app.mongoose.Schema.Types.ObjectId,
    },
    draft_id: {
      title: '草稿ID',
      type: app.mongoose.Schema.Types.ObjectId,
    },
    tablename: {
      title: '表名，不可重复',
      type: String,
      trim: true,
    },
    name: {
      title: '中文名称',
      type: String,
      trim: true,
    },
    fields: {
      title: '表字段',
      type: Array,
      default: [],
    },

    ...(app.xinMongo.createCommonAfterFields(CONFIG)),
  },
  {
    ...(app.xinMongo.createCommonOptions(CONFIG)),
  })

  app.xinMongo.createCommonIndexs(CONFIG, Schema)
  Schema.index({ group_id: 1, })
  Schema.index({ type: 1, })
  Schema.index({ tablename: 1, }, {
    unique: true,
    partialFilterExpression: { tablename: { $exists: true } }
  })

  app.xinMongo.createCommonVirtuals(CONFIG, Schema)

  Schema.virtual('virtuals', {
    ref: 'xin_table_virtual',
    localField: '_id',
    foreignField: 'table_id',
    justOne: false,
  })

  Schema.virtual('tableGroupInfo', {
    ref: 'xin_table_group',
    localField: 'group_id',
    foreignField: '_id',
    justOne: true,
  })

  Schema.virtual('tableDraftInfo', {
    ref: 'xin_table_draft',
    localField: 'draft_id',
    foreignField: '_id',
    justOne: true,
  })

  return app.mongoose.model(CONFIG.modelName, Schema, CONFIG.modelName)
}
