

const CONFIG = {
  modelName: 'xin_expand_token', // 模型名称
  tableName: '拓展授权表', // 表名称
  ispublic: false, // 是否公开
}

module.exports = (app) => {

  const Schema = new app.mongoose.Schema({
    ...(app.xinMongo.createCommonBeforeFields(CONFIG)),
  
    auth_user_id: {
      title: '用户ID',
      type: String,
      trim: true,
    },
    auth_days: {
      title: '授权时间（天）',
      type: Number,
      default: 7,
    },
    token: {
      title: 'Token',
      type: String,
      trim: true,
    },
    state: {
      title: '授权状态',
      type: String,
      ...(app.xinMongo.createEnumAttributes([
        { label: '启用', value: 'on', },
        { label: '失效', value: 'off', },
        { label: '过期', value: 'expired', },
      ])),
      default: 'on',
    },

    ...(app.xinMongo.createCommonAfterFields(CONFIG)),
  },
  {
    ...(app.xinMongo.createCommonOptions(CONFIG)),
  })

  app.xinMongo.createCommonIndexs(CONFIG, Schema)
  Schema.index({ auth_user_id: 1, })
  Schema.index({ state: 1, })

  app.xinMongo.createCommonVirtuals(CONFIG, Schema)
  Schema.virtual('authUserInfo', {
    ref: 'xin_user',
    localField: 'auth_user_id',
    foreignField: '_id',
    justOne: true,
  })

  return app.mongoose.model(CONFIG.modelName, Schema, CONFIG.modelName)
}
