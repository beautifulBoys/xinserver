
const CONFIG = {
  modelName: 'xin_user_role', // 模型名称
  tableName: '用户角色表', // 表名称
  ispublic: true, // 是否公开
}

module.exports = (app) => {

  const Schema = new app.mongoose.Schema({
    ...(app.xinMongo.createCommonBeforeFields(CONFIG)),

    name: {
      title: '名称',
      type: String,
      trim: true,
    },
    value: {
      title: '值',
      type: String,
      trim: true,
      // unique: '值({VALUE})已存在',
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
  Schema.index({ value: 1, }, { unique: true, })

  app.xinMongo.createCommonVirtuals(CONFIG, Schema)

  return app.mongoose.model(CONFIG.modelName, Schema, CONFIG.modelName)
}
