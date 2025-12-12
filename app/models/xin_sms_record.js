


const CONFIG = {
  modelName: 'xin_sms_record', // 模型名称
  tableName: '短信记录表', // 表名称
  ispublic: false, // 是否公开
}

module.exports = (app) => {

  const Schema = new app.mongoose.Schema({
    ...(app.xinMongo.createCommonBeforeFields(CONFIG)),

    type: {
      title: '短信分类',
      type: String,
      trim: true,
      default: 'sms',
      ...(app.xinMongo.createEnumAttributes([
        { label: '普通短信', value: 'sms', },
        { label: '验证码', value: 'sms_code', },
        { label: '授权过期', value: 'auth_expired', },
      ])),
    },
    mobile: {
      title: '手机号',
      type: String,
      trim: true,
    },
    sms_sign_id: {
      title: '签名ID',
      type: String,
      trim: true,
    },
    template_id: {
      title: '模板ID',
      type: String,
      trim: true,
    },
    params: {
      title: '模板变量',
      type: app.mongoose.Schema.Types.Mixed,
    },
    sendtime: {
      title: '定时发送时间',
      type: String,
      trim: true,
    },
    result: {
      title: '短信供应商商返回的发送结果',
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
