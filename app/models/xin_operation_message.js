

const CONFIG = {
  modelName: 'xin_operation_message', // 模型名称
  tableName: '运营消息通知表', // 表名称
  ispublic: false, // 是否公开
}

module.exports = (app) => {

  const Schema = new app.mongoose.Schema({
    ...(app.xinMongo.createCommonBeforeFields(CONFIG)),

    title: {
      title: '标题',
      type: String,
      trim: true,
    },
    html: {
      title: '图文内容',
      type: String,
      trim: true,
    },
    users: {
      title: '目标用户(文本)',
      type: String,
    },
    targets: [{
      title: '目标用户',
      type: app.mongoose.Schema.Types.ObjectId,
    }],
    body: {
      title: '消息附加数据',
      type: app.mongoose.Schema.Types.Mixed,
    },
    classify: {
      title: '分类',
      type: app.mongoose.Schema.Types.ObjectId,
    },
    tags: [{
      title: '标签',
      type: app.mongoose.Schema.Types.ObjectId,
    }],

    ...(app.xinMongo.createCommonAfterFields(CONFIG)),
  },
  {
    ...(app.xinMongo.createCommonOptions(CONFIG)),
  })

  app.xinMongo.createCommonIndexs(CONFIG, Schema)
  Schema.index({ classify: 1, }, {})
  Schema.index({ state: 1, })
  Schema.index({ tags: 1, })

  app.xinMongo.createCommonVirtuals(CONFIG, Schema)
  Schema.virtual('classifyInfo', {
    ref: 'xin_dictionary',
    localField: 'classify',
    foreignField: '_id',
    justOne: true,
  })
  Schema.virtual('tagInfos', {
    ref: 'xin_dictionary',
    localField: 'tags',
    foreignField: '_id',
    justOne: false,
  })
  Schema.virtual('targetInfos', {
    ref: 'xin_user',
    localField: 'targets',
    foreignField: '_id',
    justOne: false,
  })

  return app.mongoose.model(CONFIG.modelName, Schema, CONFIG.modelName)
}
