


const CONFIG = {
  modelName: 'xin_devops_backup', // 模型名称
  tableName: '备份记录表', // 表名称
  ispublic: false, // 是否公开
}

module.exports = (app) => {

  const Schema = new app.mongoose.Schema({
    ...(app.xinMongo.createCommonBeforeFields(CONFIG)),

    type: {
      title: '类型',
      type: String,
      trim: true,
      default: 'project',
      ...(app.xinMongo.createEnumAttributes([
        { label: '项目', value: 'project', },
        { label: 'MONGO', value: 'mongo', },
        { label: 'MYSQL', value: 'mysql', },
      ])),
    },
    direction: {
      title: '操作类型',
      type: String,
      trim: true,
      default: 'backup',
      ...(app.xinMongo.createEnumAttributes([
        { label: '备份', value: 'backup', },
        { label: '恢复', value: 'restore', },
      ])),
    },
    name: {
      title: '文件名',
      type: String,
      trim: true,
    },
    url: {
      title: '下载地址',
      type: String,
      trim: true,
    },
    inset_url: {
      title: '容器下载地址',
      type: String,
      trim: true,
    },
    size: {
      title: '大小',
      type: Number,
    },
    result: {
      title: '备份结果',
      type: app.mongoose.Schema.Types.Mixed,
    },
    state: {
      title: '状态',
      type: String,
      default: 'pending',
      trim: true,
      ...(app.xinMongo.createEnumAttributes([
        { label: '备份中', value: 'pending', },
        { label: '备份成功', value: 'success', },
        { label: '备份失败', value: 'failed', },
      ])),
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
