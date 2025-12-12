

const CONFIG = {
  modelName: 'xin_resource', // 模型名称
  tableName: '资源表', // 表名称
  ispublic: true, // 是否公开
}

module.exports = (app) => {

  const Schema = new app.mongoose.Schema({
    ...(app.xinMongo.createCommonBeforeFields(CONFIG)),

    group_id: {
      title: '分组ID',
      type: app.mongoose.Schema.Types.ObjectId,
    },
    name: {
      title: '文件名称',
      type: String,
      trim: true,
    },
    classify: {
      title: '类别',
      type: String,
      trim: true,
      default: 'file',
      ...(app.xinMongo.createEnumAttributes([
        { label: '文件', value: 'file', },
        { label: '预览图', value: 'snapshot', },
      ])),
    },
    provider: {
      title: '存储服务商',
      type: String,
      trim: true,
      // ...(app.xinMongo.createEnumAttributes([
      //   { label: '本地存储', value: 'local_cdn', },
      //   { label: '七牛云', value: 'qiniu_cdn', },
      //   { label: '腾讯云', value: 'tencent_cdn', },
      //   { label: '阿里云', value: 'aliyun_cdn', },
      // ])),
    },
    mime_type: {
      title: '文件类型',
      type: String,
      trim: true,
    },
    url: {
      title: '存储地址',
      type: String,
      trim: true,
    },
    size: {
      title: '文件大小',
      type: Number,
      trim: true,
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

  Schema.virtual('groupInfo', {
    ref: 'xin_resource_group',
    localField: 'group_id',
    foreignField: '_id',
    justOne: true,
  })

  return app.mongoose.model(CONFIG.modelName, Schema, CONFIG.modelName)
}
