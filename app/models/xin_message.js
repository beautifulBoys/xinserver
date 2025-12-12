

const CONFIG = {
  modelName: 'xin_message', // 模型名称
  tableName: '消息表', // 表名称
  ispublic: true, // 是否公开
}

module.exports = (app) => {

  const Schema = new app.mongoose.Schema({
    ...(app.xinMongo.createCommonBeforeFields(CONFIG)),
  
    type: {
      title: '类型，分类',
      type: String,
      trim: true,
      require: true,
    },
    title: {
      title: '标题',
      type: String,
      trim: true,
    },
    content: {
      title: '内容',
      type: String,
      trim: true,
    },
    body: {
      title: '消息附加数据',
      type: app.mongoose.Schema.Types.Mixed,
    },
    state: {
      title: '状态',
      type: Number,
      ...(app.xinMongo.createEnumAttributes([
        { label: '未读', value: 0, },
        { label: '已读', value: 1, },
      ])),
      default: 0,
    },
    receive_user_id: {
      title: '接收用户',
      type: app.mongoose.Schema.Types.ObjectId,
    },
    level: {
      title: '级别',
      type: Number,
      trim: true,
      default: 0,
    },
    tags: {
      title: '标签',
      type: Array,
    },
    is_topping: {
      title: '是否置顶',
      type: Boolean,
      default: false,
    },
    expire_time: {
      title: '过期时间',
      type: Number,
    },

    ...(app.xinMongo.createCommonAfterFields(CONFIG)),
  },
  {
    ...(app.xinMongo.createCommonOptions(CONFIG)),
  })

  app.xinMongo.createCommonIndexs(CONFIG, Schema)
  Schema.index({ type: 1, })
  Schema.index({ state: 1, })
  Schema.index({ receive_user_id: 1, })

  app.xinMongo.createCommonVirtuals(CONFIG, Schema)

  Schema.virtual('receiveUserInfo', {
    ref: 'xin_user',
    localField: 'receive_user_id',
    foreignField: '_id',
    justOne: true,
  })

  return app.mongoose.model(CONFIG.modelName, Schema, CONFIG.modelName)
}
