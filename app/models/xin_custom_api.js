

const CONFIG = {
  modelName: 'xin_custom_api', // 模型名称
  tableName: '自定义接口表', // 表名称
  ispublic: false, // 是否公开
}

module.exports = (app) => {

  const Schema = new app.mongoose.Schema({
    ...(app.xinMongo.createCommonBeforeFields(CONFIG)),
  
    name: {
      title: '接口名称',
      type: String,
      trim: true,
    },
    url: {
      title: '接口Url',
      type: String,
      trim: true,
    },
    project_unique_id: {
      title: '项目唯一ID',
      type: String,
      trim: true,
    },
    prefix_url: {
      title: '接口前置Url',
      type: String,
      trim: true,
    },
    method: {
      title: '请求方法',
      type: String,
      default: 'GET',
    },
    token: {
      title: 'TOKEN',
      type: String,
      trim: true,
    },
    script: {
      title: '执行脚本',
      type: String,
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

    ...(app.xinMongo.createCommonAfterFields(CONFIG)),
  },
  {
    ...(app.xinMongo.createCommonOptions(CONFIG)),
  })

  app.xinMongo.createCommonIndexs(CONFIG, Schema)
  Schema.index({ url: 1, })
  Schema.index({ method: 1, })
  Schema.index({ state: 1, })

  app.xinMongo.createCommonVirtuals(CONFIG, Schema)

  return app.mongoose.model(CONFIG.modelName, Schema, CONFIG.modelName)
}
