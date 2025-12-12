// 存项目配置信息


const CONFIG = {
  modelName: 'xin_config', // 模型名称
  tableName: '参数配置表', // 表名称
  ispublic: true, // 是否公开
}

module.exports = (app) => {

  const Schema = new app.mongoose.Schema({
    ...(app.xinMongo.createCommonBeforeFields(CONFIG)),

    name: {
      title: '参数名称',
      type: String,
      trim: true,
    },
    inset: {
      title: '是否系统内置',
      type: Boolean,
      default: false,
    },
    description: {
      title: '描述',
      type: String,
      trim: true,
    },
    key: {
      title: '参数键名',
      type: String,
      trim: true,
    },
    value: {
      title: '参数键值',
      type: app.mongoose.Schema.Types.Mixed,
    },
    tags: {
      title: '标签：如果多个参数可以编为一组，查询的时候可以通过tags来过滤',
      type: Array,
    },

    ...(app.xinMongo.createCommonAfterFields(CONFIG)),
  },
  {
    ...(app.xinMongo.createCommonOptions(CONFIG)),
  })

  app.xinMongo.createCommonIndexs(CONFIG, Schema)
  Schema.index({ key: 1, }, { unique: true, })

  app.xinMongo.createCommonVirtuals(CONFIG, Schema)

  return app.mongoose.model(CONFIG.modelName, Schema, CONFIG.modelName)
}
