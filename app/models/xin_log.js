

const CONFIG = {
  modelName: 'xin_log', // 模型名称
  tableName: '日志表', // 表名称
  ispublic: false, // 是否公开
}

module.exports = (app) => {

  const Schema = new app.mongoose.Schema({
    ...(app.xinMongo.createCommonBeforeFields(CONFIG)),
  
    name: {
      title: '名称',
      type: String,
      trim: true,
    },
    type: {
      title: '类型。举例：table_record_create',
      type: String,
      trim: true,
    },
    description: {
      title: '描述信息',
      type: String,
      trim: true,
    },
    api: {
      title: '接口地址',
      type: String,
      trim: true,
    },
    level: {
      title: '级别',
      type: Number,
      default: 0,
    },
    action_status: {
      title: '操作结果  true：成功， false：失败',
      type: Boolean,
      default: true,
    },
    ip: {
      title: 'IP',
      type: String,
    },
    body: {
      title: '内容',
      type: app.mongoose.Schema.Types.Mixed,
    },
    create_user_token: {
      title: 'Token',
      type: String,
    },

    ...(app.xinMongo.createCommonAfterFields(CONFIG)),
  },
  {
    ...(app.xinMongo.createCommonOptions(CONFIG)),
  })

  app.xinMongo.createCommonIndexs(CONFIG, Schema)
  Schema.index({ type: 1, create_time: -1 })
  Schema.index({ api: 1, create_time: -1 })
  Schema.index({ ip: 1, create_time: -1 })
  Schema.index({ action_status: 1, create_time: -1 })

  app.xinMongo.createCommonVirtuals(CONFIG, Schema)

  return app.mongoose.model(CONFIG.modelName, Schema, CONFIG.modelName)
}
