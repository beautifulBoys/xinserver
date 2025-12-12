

const CONFIG = {
  modelName: 'xin_permission', // 模型名称
  tableName: '权限表', // 表名称
  ispublic: false, // 是否公开
}

module.exports = (app) => {

  const Schema = new app.mongoose.Schema({
    ...(app.xinMongo.createCommonBeforeFields(CONFIG)),

    name: {
      title: '权限名称',
      type: String,
      trim: true,
    },
    value: {
      title: '权限值',
      type: String,
      trim: true,
    },
    group_name1: {
      title: '一级分组名称',
      type: String,
      trim: true,
    },
    group_name2: {
      title: '二级分组名称',
      type: String,
      trim: true,
    },

    ...(app.xinMongo.createCommonAfterFields(CONFIG)),
  },
  {
    ...(app.xinMongo.createCommonOptions(CONFIG)),
  })

  app.xinMongo.createCommonIndexs(CONFIG, Schema)
  Schema.index({ value: 1, }, {
    unique: true,
    partialFilterExpression: { value: { $exists: true } }
  })

  app.xinMongo.createCommonVirtuals(CONFIG, Schema)

  return app.mongoose.model(CONFIG.modelName, Schema, CONFIG.modelName)
}
