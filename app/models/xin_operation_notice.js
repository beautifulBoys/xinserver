

const CONFIG = {
  modelName: 'xin_operation_notice', // 模型名称
  tableName: '运营公告表', // 表名称
  ispublic: true, // 是否公开
}

module.exports = (app) => {

  const Schema = new app.mongoose.Schema({
    ...(app.xinMongo.createCommonBeforeFields(CONFIG)),

    title: {
      title: '标题',
      type: String,
      trim: true,
    },
    classify: {
      title: '分类',
      type: app.mongoose.Schema.Types.ObjectId,
    },
    html: {
      title: '图文内容',
      type: String,
      trim: true,
    },
    body: {
      title: '消息附加数据',
      type: app.mongoose.Schema.Types.Mixed,
    },
    files: {
      title: '附件',
      type: Array,
      default: [],
    },
    state: {
      title: '状态',
      type: Number,
      ...(app.xinMongo.createEnumAttributes([
        { label: '草稿', value: 0, },
        { label: '已发布', value: 1, },
      ])),
      default: 0,
    },
    author: {
      title: '作者',
      type: String,
      trim: true,
    },
    tags: [{
      title: '标签',
      type: app.mongoose.Schema.Types.ObjectId,
    }],
    publish_time: {
      title: '发布时间',
      type: Number,
      default: Date.now,
    },
    is_topping: {
      title: '是否置顶',
      type: Boolean,
      default: false,
    },
    is_great: {
      title: '是否精选',
      type: Boolean,
      default: false,
    },
    is_hot: {
      title: '是否热门',
      type: Boolean,
      default: false,
    },
    read_number: {
      title: '阅读数量',
      type: Number,
      default: 0,
    },
    star_number: {
      title: '点赞数量',
      type: Number,
      default: 0,
    },
    comment_number: {
      title: '评论数量',
      type: Number,
      default: 0,
    },
    favourite_number: {
      title: '收藏数量',
      type: Number,
      default: 0,
    },

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

  return app.mongoose.model(CONFIG.modelName, Schema, CONFIG.modelName)
}
