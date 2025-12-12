

const CONFIG = {
  modelName: 'xin_resource_group', // 模型名称
  tableName: '资源分组表', // 表名称
  ispublic: false, // 是否公开
}

module.exports = (app) => {

  const Schema = new app.mongoose.Schema({
    ...(app.xinMongo.createCommonBeforeFields(CONFIG)),

    parent_id: {
      title: '父级目录ID',
      type: app.mongoose.Schema.Types.ObjectId,
    },
    name: {
      title: '分组名称',
      type: String,
      trim: true,
    },
    type: {
      title: '类型',
      type: String,
      trim: true,
      ...(app.xinMongo.createEnumAttributes([
        { label: '目录', value: 'dir', },
      ])),
      default: 'dir',
    },

    ...(app.xinMongo.createCommonAfterFields(CONFIG)),
  },
  {
    ...(app.xinMongo.createCommonOptions(CONFIG)),
  })

  app.xinMongo.createCommonIndexs(CONFIG, Schema)

  app.xinMongo.createCommonVirtuals(CONFIG, Schema)

  Schema.virtual('resourceGroupInfo', {
    ref: 'xin_resource_group',
    localField: 'parent_id',
    foreignField: '_id',
    justOne: true,
  })

  return app.mongoose.model(CONFIG.modelName, Schema, CONFIG.modelName)
}
