// 我安装的应用

const CONFIG = {
  modelName: 'xin_saas_myapp', // 模型名称
  tableName: 'SaaS应用表', // 表名称
  ispublic: false, // 是否公开
}


module.exports = (app) => {

  const Schema = new app.mongoose.Schema({
    ...(app.xinMongo.createCommonBeforeFields(CONFIG)),

    platform_type: {
      title: '平台类型',
      type: String,
      trim: true,
      default: 'lowcode',
      ...(app.xinMongo.createEnumAttributes([
        { label: '无代码', value: 'nocode', },
        { label: '低代码', value: 'lowcode', },
      ])),
    },
    from_type: {
      title: '来源类型',
      type: String,
      trim: true,
      default: 'market',
      ...(app.xinMongo.createEnumAttributes([
        { label: '市场应用，应用市场添加的', value: 'market', },
        { label: '自建应用，自己建立后添加的', value: 'create', },
        { label: '自建三方应用，通过url添加的', value: 'three', },
        { label: '兑换应用，通过project_id兑换的', value: 'exchange', },
      ])),
    },
    name: {
      title: '名称', // 自建应用，三方应用 使用
      type: String,
      trim: true,
    },
    logo: {
      title: 'LOGO',
      type: app.mongoose.Schema.Types.Mixed,
    },
    url: {
      title: '链接地址',
      type: String,
      trim: true,
    },
    nocode_app_id: {
      title: '无代码应用ID',
      type: app.mongoose.Schema.Types.ObjectId,
    },
    app_project_id: {
      title: '应用安装App源项目ID',
      type: app.mongoose.Schema.Types.ObjectId,
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
        { label: '兑换', value: 'exchange', },
      ])),
    },
    // 订阅授权相关信息
    license: {
      expire_time: {
        title: '过期日期',
        type: Number,
        default: Date.now,
      },
      recordNumber: {
        title: '记录数',
        type: Number,
        default: 100,
      },
      userNumber: {
        title: '用户数',
        type: Number,
        default: 5,
      },
    },

    ...(app.xinMongo.createCommonAfterFields(CONFIG)),
  },
  {
    ...(app.xinMongo.createCommonOptions(CONFIG)),
  })

  app.xinMongo.createCommonIndexs(CONFIG, Schema)

  app.xinMongo.createCommonVirtuals(CONFIG, Schema)

  Schema.virtual('nocodeAppInfo', {
    ref: 'xin_nocode_app',
    localField: 'nocode_app_id',
    foreignField: '_id',
    justOne: true,
  })

  Schema.virtual('appProjectInfo', {
    ref: 'xin_project',
    localField: 'app_project_id',
    foreignField: '_id',
    justOne: true,
  })

  return app.mongoose.model(CONFIG.modelName, Schema, CONFIG.modelName)
}
