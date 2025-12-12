


const CONFIG = {
  modelName: 'xin_email_record', // 模型名称
  tableName: '邮件记录表', // 表名称
  ispublic: false, // 是否公开
}

module.exports = (app) => {

  const Schema = new app.mongoose.Schema({
    ...(app.xinMongo.createCommonBeforeFields(CONFIG)),

    type: {
      title: '邮件分类',
      type: String,
      trim: true,
      default: 'email',
      ...(app.xinMongo.createEnumAttributes([
        { label: '普通邮件', value: 'email', },
        { label: '验证码', value: 'email_code', },
        { label: '授权过期', value: 'auth_expired', },
      ])),
    },
    email: {
      title: '邮箱',
      type: String,
      trim: true,
    },
    params: {
      title: '模板变量',
      type: app.mongoose.Schema.Types.Mixed,
    },
    result: {
      title: '供应商商返回的发送结果',
      type: app.mongoose.Schema.Types.Mixed,
    },
    ip: {
      title: '触发人IP',
      type: String,
    },
    checked: {
      title: '验证状态（是否已验证）',
      type: Boolean,
      default: false,
    },

    ...(app.xinMongo.createCommonAfterFields(CONFIG)),
  },
  {
    ...(app.xinMongo.createCommonOptions(CONFIG)),
  })

  app.xinMongo.createCommonIndexs(CONFIG, Schema)

  app.xinMongo.createCommonVirtuals(CONFIG, Schema)

  return app.mongoose.model(CONFIG.modelName, Schema, CONFIG.modelName)
}
