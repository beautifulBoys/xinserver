// 用户订阅插件列表

const CONFIG = {
  modelName: 'xin_myconnector', // 模型名称
  tableName: '我的连接器表', // 表名称
  ispublic: false, // 是否公开
}

module.exports = (app) => {

  const Schema = new app.mongoose.Schema({
    ...(app.xinMongo.createCommonBeforeFields(CONFIG)),
  
    module_type: {
      title: '连接器唯一KEY',
      type: String,
      trim: true,
    },
    type: {
      title: '分类',
      type: String,
      trim: true,
    },
    name: {
      title: '名称',
      type: String,
      trim: true,
    },
    icon: {
      title: '图标',
      type: String,
      trim: true,
    },
    author: {
      title: '作者',
      type: String,
      trim: true,
    },
    script: {
      title: '执行脚本',
      type: String,
      trim: true,
    },
    control: {
      title: '配置项',
      type: app.mongoose.Schema.Types.Mixed,
    },
    exports: {
      title: '输出值定义',
      type: app.mongoose.Schema.Types.Mixed,
    },
    from_type: {
      title: '来源类型',
      type: String,
      trim: true,
      default: 'create',
      ...(app.xinMongo.createEnumAttributes([
        { label: '市场应用，应用市场添加的', value: 'market', },
        { label: '自建应用，自己建立后添加的', value: 'create', }, // 自建的可以直接
      ])),
    },
    file_type: {
      title: '获取类型',
      type: String,
      trim: true,
      default: 'inset',
      ...(app.xinMongo.createEnumAttributes([
        { label: '内置', value: 'inset', },
        { label: '需加载', value: 'load', },
      ])),
    },
    version: {
      title: '插件版本号',
      type: String,
      trim: true,
      default: '1.0.0',
    },
    state: {
      title: '开通状态',
      type: Boolean,
      default: true,
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

  app.xinMongo.createCommonVirtuals(CONFIG, Schema)

  return app.mongoose.model(CONFIG.modelName, Schema, CONFIG.modelName)
}
