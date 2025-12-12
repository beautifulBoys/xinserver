


const CONFIG = {
  modelName: 'xin_saas_order', // 模型名称
  tableName: 'SaaS订单表', // 表名称
  ispublic: false, // 是否公开
}

module.exports = (app) => {

  const Schema = new app.mongoose.Schema({
    ...(app.xinMongo.createCommonBeforeFields(CONFIG)),

    classify: {
      title: '产品分类',
      type: String,
      trim: true,
      default: '应用',
      ...(app.xinMongo.createEnumAttributes([
        { label: '应用', },
        { label: '插件', },
        { label: '可视化', },
        { label: '代码块', },
        { label: '数据表', },
      ])),
    },
    app_project_id: {
      title: '源项目ID，应用的时候用',
      type: app.mongoose.Schema.Types.ObjectId,
    },
    pay_method: {
      title: '支付类型',
      type: String,
      trim: true,
      default: '免费试用',
      ...(app.xinMongo.createEnumAttributes([
        { label: '免费试用', },
        { label: '应用兑换', },
        { label: '支付宝', },
        { label: '微信支付', },
      ])),
    },
    order_state: {
      title: '支付状态',
      type: String,
      trim: true,
      default: '待支付',
      ...(app.xinMongo.createEnumAttributes([
        { label: '待支付', },
        { label: '已支付', },
      ])),
    },
    expire_time: {
      title: '过期日期',
      type: Number,
      default: Date.now,
    },
    name: {
      title: '产品名称',
      type: String,
      trim: true,
    },
    price: {
      title: '价格',
      type: Number,
      default: 0,
    },

    ...(app.xinMongo.createCommonAfterFields(CONFIG)),
  },
  {
    ...(app.xinMongo.createCommonOptions(CONFIG)),
  })

  app.xinMongo.createCommonIndexs(CONFIG, Schema)
  Schema.index({ group_id: 1, })
  Schema.index({ type: 1, })

  app.xinMongo.createCommonVirtuals(CONFIG, Schema)

  Schema.virtual('appProjectInfo', {
    ref: 'xin_project',
    localField: 'app_project_id',
    foreignField: '_id',
    justOne: true,
  })

  return app.mongoose.model(CONFIG.modelName, Schema, CONFIG.modelName)
}
