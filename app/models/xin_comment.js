


const CONFIG = {
  modelName: 'xin_comment', // 模型名称
  tableName: '评论表', // 表名称
  ispublic: false, // 是否公开
}

module.exports = (app) => {

  const Schema = new app.mongoose.Schema({
    ...(app.xinMongo.createCommonBeforeFields(CONFIG)),

    target_key: {
      title: '目标Key，例如：文章的评论区就是文章ID，用户也可以自定义',
      type: String,
      trim: true,
    },
    group_id: {
      title: '评论组ID，一个评论为一个评论组，回复为评论组内容',
      type: app.mongoose.Schema.Types.ObjectId,
    },
    content: {
      title: '内容',
      type: String,
      trim: true,
    },
    html: {
      title: '内容',
      type: String,
      trim: true,
    },
    images: {
      title: '图片',
      type: Array,
      default: () => [],
    },
    read_number: {
      title: '浏览数',
      type: Number,
      default: 0,
    },
    agree_number: {
      title: '赞同数',
      type: Number,
      default: 0,
    },
    oppose_number: {
      title: '反对数',
      type: Number,
      default: 0,
    },
    reply_number: {
      title: '回复数',
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

  app.xinMongo.createCommonVirtuals(CONFIG, Schema)

  return app.mongoose.model(CONFIG.modelName, Schema, CONFIG.modelName)
}
