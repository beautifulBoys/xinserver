
// 我安装的应用、系统的授权信息

const CONFIG = {
  modelName: 'xin_saas_mylicense', // 模型名称
  tableName: 'SaaS授权表', // 表名称
  ispublic: false, // 是否公开
}


module.exports = (app) => {

  const Schema = new app.mongoose.Schema({
    ...(app.xinMongo.createCommonBeforeFields(CONFIG)),

    license_string: {
      title: '授权字符串，加密内容',
      type: String,
      trim: true,
    },

    // type: { machineid: '机器码', machineid_projectid: '机器码+项目ID', noauth: '不校验', }

    project_id: {
      title: '项目ID',
      type: app.mongoose.Schema.Types.ObjectId,
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
