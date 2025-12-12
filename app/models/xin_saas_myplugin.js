
// 我安装的应用

const CONFIG = {
  modelName: 'xin_saas_myplugin', // 模型名称
  tableName: 'SaaS插件表', // 表名称
  ispublic: false, // 是否公开
}


module.exports = (app) => {

  const Schema = new app.mongoose.Schema({
    ...(app.xinMongo.createCommonBeforeFields(CONFIG)),

    type: {
      title: '类型',
      type: String,
      trim: true,
      default: 'plugin',
      ...(app.xinMongo.createEnumAttributes([
        { label: '插件', value: 'plugin', },
      ])),
    },
    module_key: {
      title: '插件名。必须唯一，不可以重复',
      type: String,
      trim: true,
    },
    name: {
      title: '名称',
      type: String,
      trim: true,
    },
    description: {
      title: '描述',
      type: String,
      trim: true,
    },
    version: {
      title: '版本号',
      type: String,
      trim: true,
    },
    from_type: {
      title: '来源类型',
      type: String,
      trim: true,
      default: 'market',
      ...(app.xinMongo.createEnumAttributes([
        { label: '市场应用，应用市场添加的', value: 'market', },
        { label: '自建应用，自己建立后添加的', value: 'create', }, // 自建的可以直接
      ])),
    },
    use_type: {
      title: '使用类型',
      type: String,
      trim: true,
      default: 'free',
      ...(app.xinMongo.createEnumAttributes([
        { label: '免费', value: 'free', },
        { label: '免费试用', value: 'shiyong', },
        { label: '付费', value: 'pay', },
      ])),
    },
    load_type: {
      title: '加载方式',
      type: String,
      trim: true,
      default: '内置',
      ...(app.xinMongo.createEnumAttributes([
        { label: '内置', value: '内置', },
        { label: '需加载', value: '需加载', },
      ])),
    },
    load_url: {
      title: '加载地址',
      type: String,
      trim: true,
    },
    state: {
      title: '状态',
      type: String,
      trim: true,
      default: 'off',
      ...(app.xinMongo.createEnumAttributes([
        { label: '启用', value: 'on', },
        { label: '禁用', value: 'off', },
      ])),
    },
    settings: {
      title: '配置内容',
      type: app.mongoose.Schema.Types.Mixed,
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
