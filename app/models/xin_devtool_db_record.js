

const CONFIG = {
  modelName: 'xin_devtool_db_record', // 模型名称
  tableName: '数据表执行记录表', // 表名称
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
    script: {
      title: '脚本内容',
      type: String,
      trim: true,
    },
    is_toolbox: {
      title: '是否改为按钮形式，按钮形式是工具箱使用',
      type: Boolean,
      default: false,
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
