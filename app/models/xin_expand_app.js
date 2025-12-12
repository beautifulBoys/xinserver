

const CONFIG = {
  modelName: 'xin_expand_app', // 模型名称
  tableName: '拓展应用表', // 表名称
  ispublic: false, // 是否公开
}

module.exports = (app) => {

  const Schema = new app.mongoose.Schema({
    ...(app.xinMongo.createCommonBeforeFields(CONFIG)),
  
    app_key: {
      title: '应用Key',
      type: String,
      trim: true,
    },
    app_secret: {
      title: '应用Secret',
      type: String,
      trim: true,
    },
    type: {
      title: '类型',
      type: String,
      trim: true,
      default: 'expand_auth',
      ...(app.xinMongo.createEnumAttributes([
        { label: '拓展开发-权限', value: 'expand_auth', },
      ])),
    },
    roles: {
      title: '角色集',
      type: Array,
    },
    permissions: {
      title: '权限集',
      type: Array,
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
