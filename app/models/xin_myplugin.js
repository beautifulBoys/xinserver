// 用户订阅插件列表

const CONFIG = {
  modelName: 'xin_myplugin', // 模型名称
  tableName: '我的插件表', // 表名称
  ispublic: false, // 是否公开
}

module.exports = (app) => {

  const Schema = new app.mongoose.Schema({
    ...(app.xinMongo.createCommonBeforeFields(CONFIG)),
  
    plugin_id: {
      title: '插件ID，在center项目中的ID',
      type: String,
      trim: true,
    },
    name: {
      title: '插件名称',
      type: String,
      trim: true,
    },
    plugin_name: {
      title: '插件名',
      type: String,
      trim: true,
    },
    plugin_type: {
      title: '插件类型',
      type: String,
      trim: true,
      default: 'inset',
      ...(app.xinMongo.createEnumAttributes([
        { label: '内置', value: 'inset', },
        { label: '需加载', value: 'load', },
      ])),
    },
    plugin_url: {
      title: '插件地址',
      type: String,
      trim: true,
    },
    plugin_version: {
      title: '插件版本号',
      type: String,
      trim: true,
      default: '1.0.0',
    },
    state: {
      title: '开通状态',
      type: Boolean,
      default: false,
    },
    attributes: {
      title: '配置项值',
      type: app.mongoose.Schema.Types.Mixed,
      default: () => ({}),
    },
    expire_time: {
      title: '过期时间',
      type: Number,
      default: Date.now,
    },

    ...(app.xinMongo.createCommonAfterFields(CONFIG)),
  },
  {
    ...(app.xinMongo.createCommonOptions(CONFIG)),
  })

  app.xinMongo.createCommonIndexs(CONFIG, Schema)
  Schema.index({ plugin_id: 1, })
  Schema.index({ state: 1, })

  app.xinMongo.createCommonVirtuals(CONFIG, Schema)

  Schema.virtual('pluginInfo', {
    ref: 'Plugin',
    localField: 'plugin_id',
    foreignField: '_id',
    justOne: true,
  })

  return app.mongoose.model(CONFIG.modelName, Schema, CONFIG.modelName)
}
