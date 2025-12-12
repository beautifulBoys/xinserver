

const CONFIG = {
  modelName: 'xin_test', // 模型名称
  tableName: '测试表', // 表名称
  ispublic: false, // 是否公开
}

module.exports = (app) => {

  const Schema = new app.mongoose.Schema({
    ...(app.xinMongo.createCommonBeforeFields(CONFIG)),

    name: {
      title: '项目名称',
      type: String,
      trim: true,
    },
    test_id: {
      title: '编号',
      type: app.mongoose.Schema.Types.ObjectId,
    },
    // secondinfo: {
    //   age: {
    //     title: '数量1',
    //     type: Number,
    //     default: 29,
    //   },
    //   name: {
    //     title: '名称1',
    //     type: String,
    //   },
    // },

    ...(app.xinMongo.createCommonAfterFields(CONFIG)),
  },
  {
    ...(app.xinMongo.createCommonOptions(CONFIG)),
  })

  app.xinMongo.createCommonIndexs(CONFIG, Schema)

  app.xinMongo.createCommonVirtuals(CONFIG, Schema)

  return app.mongoose.model(CONFIG.modelName, Schema, CONFIG.modelName)
}
