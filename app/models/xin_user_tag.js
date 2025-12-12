

const CONFIG = {
  modelName: 'xin_user_tag', // 模型名称
  tableName: '用户标签表', // 表名称
  ispublic: true, // 是否公开
}

module.exports = (app) => {

  const Schema = new app.mongoose.Schema({
    ...(app.xinMongo.createCommonBeforeFields(CONFIG)),

    type: {
      title: '类型',
      type: String,
      trim: true,
      default: 'outside',
      ...(app.xinMongo.createEnumAttributes([
        { label: '内部用户', value: 'inside', },
        { label: '外部用户', value: 'outside', },
        { label: '职位', value: 'position', },
        { label: '自定义', value: 'custom', },
      ])),
    },
    name: {
      title: '名称',
      type: String,
      trim: true,
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
