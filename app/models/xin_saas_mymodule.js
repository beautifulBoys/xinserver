// 记录我添加的 plugin, connector。。

const CONFIG = {
  modelName: 'xin_saas_mymodule', // 模型名称
  tableName: 'SaaS模块表', // 表名称
  ispublic: false, // 是否公开
}

module.exports = (app) => {

  const Schema = new app.mongoose.Schema({
    ...(app.xinMongo.createCommonBeforeFields(CONFIG)),

    type: {
      title: '类型',
      type: String,
      trim: true,
      default: 'plugin',
      ...(app.xinMongo.createEnumAttributes([
        { label: '插件', value: 'plugin', },
        { label: '连接器', value: 'connector', },
      ])),
    },
    module_key: {
      title: '模块的KEY，用于区分是什么模块',
      type: String,
    },
    expire_time: {
      title: '过期日期',
      type: Number,
      default: Date.now,
    },

    ...(app.xinMongo.createCommonAfterFields(CONFIG)),
  },
  {
    ...(app.xinMongo.createCommonOptions(CONFIG)),
  })

  app.xinMongo.createCommonIndexs(CONFIG, Schema)
  Schema.index({ type: 1, })

  app.xinMongo.createCommonVirtuals(CONFIG, Schema)

  return app.mongoose.model(CONFIG.modelName, Schema, CONFIG.modelName)
}
