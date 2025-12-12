

const CONFIG = {
  modelName: 'xin_wx', // 模型名称
  tableName: '微信记录表', // 表名称
  ispublic: false, // 是否公开
}

module.exports = (app) => {

  const Schema = new app.mongoose.Schema({
    ...(app.xinMongo.createCommonBeforeFields(CONFIG)),

    type: {
      title: '类型',
      type: String,
      trim: true,
      default: 'access_token',
      enum: [
      ].map(item => item.value),
      ...(app.xinMongo.createEnumAttributes([
        { label: 'AccessToken', value: 'access_token', },
        { label: 'wx_key', value: 'wx_key', desc: '微信公众服务号扫码登录相关，有没有扫到，这里前端需要轮询', },
      ])),
    },
    value: {
      title: '值',
      type: app.mongoose.Schema.Types.Mixed,
    },
    // 用于公众号扫码登录回调后存入openid
    wx_openid: {
      title: '微信OpenId',
      type: String,
      trim: true,
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
