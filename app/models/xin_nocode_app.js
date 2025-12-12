


const CONFIG = {
  modelName: 'xin_nocode_app', // 模型名称
  tableName: '无代码应用表', // 表名称
  ispublic: false, // 是否公开
}

module.exports = (app) => {

  const Schema = new app.mongoose.Schema({
    ...(app.xinMongo.createCommonBeforeFields(CONFIG)),
  
    name: {
      title: '名称',
      type: String,
      trim: true,
    },
    logo: {
      title: 'LOGO',
      type: app.mongoose.Schema.Types.Mixed,
    },
    description: {
      title: '描述',
      type: String,
      trim: true,
    },
    primary_color: {
      title: '主色',
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

  Schema.virtual('menus', {
    ref: 'xin_nocode_app_menu',
    localField: '_id',
    foreignField: 'nocode_app_id',
    justOne: false,
  })

  return app.mongoose.model(CONFIG.modelName, Schema, CONFIG.modelName)
}
