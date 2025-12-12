

const CONFIG = {
  modelName: 'xin_dictionary', // 模型名称
  tableName: '数据字典表', // 表名称
  ispublic: true, // 是否公开
}

module.exports = (app) => {

  const Schema = new app.mongoose.Schema({
    ...(app.xinMongo.createCommonBeforeFields(CONFIG)),
  
    dictionary_id: {
      title: '所属字典ID，只有字典值记录才有，每个值记录都有',
      type: app.mongoose.Schema.Types.ObjectId,
    },
    inset: {
      title: '是否系统内置',
      type: Boolean,
      default: false,
    },
    parent_id: { // 字典记录的tree结构锚点
      title: '上级ID，只有字典值记录才有',
      type: app.mongoose.Schema.Types.ObjectId,
    },
    name: {
      title: '字典名称',
      type: String,
      trim: true,
    },
    value: { // 系统默认的字典需要用value来区分和查询。。。字典值暂时不使用，所有都按_id来算。
      title: '字典值',
      type: String,
      trim: true,
    },
    color: {
      title: '颜色',
      type: app.mongoose.Schema.Types.Mixed,
    },
    state: {
      title: '状态',
      type: Number,
      ...(app.xinMongo.createEnumAttributes([
        { label: '启用', value: 0, },
        { label: '禁用', value: 1, },
      ])),
      default: 0,
    },
    sort: {
      title: '排序',
      type: Number,
      default: 0,
    },

    ...(app.xinMongo.createCommonAfterFields(CONFIG)),
  },
  {
    ...(app.xinMongo.createCommonOptions(CONFIG)),
  })

  app.xinMongo.createCommonIndexs(CONFIG, Schema)
  Schema.index({ state: 1, })
  Schema.index({ dictionary_id: 1, })
  Schema.index({ name: 1, })
  Schema.index({ dictionary_id: 1, value: 1, }, {
    unique: true,
    partialFilterExpression: { value: { $exists: true }, dictionary_id: { $exists: true } }
  })

  app.xinMongo.createCommonVirtuals(CONFIG, Schema)

  return app.mongoose.model(CONFIG.modelName, Schema, CONFIG.modelName)
}
