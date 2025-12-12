


const CONFIG = {
  modelName: 'xin_nocode_app_menu', // 模型名称
  tableName: '无代码应用菜单表', // 表名称
  ispublic: false, // 是否公开
}

module.exports = (app) => {

  const Schema = new app.mongoose.Schema({
    ...(app.xinMongo.createCommonBeforeFields(CONFIG)),
  
    nocode_app_id: {
      title: '无代码应用ID',
      type: app.mongoose.Schema.Types.ObjectId,
    },
    parent_id: {
      title: '父级ID',
      type: app.mongoose.Schema.Types.ObjectId,
    },
    name: { // 只有当type=group时，启用该值，其他情况如：table的时候用tableInfo.name值。
      title: '名称',
      type: String,
      trim: true,
    },
    icon: {
      title: 'LOGO',
      type: String,
    },
    type: {
      title: '类型',
      type: String,
      trim: true,
      default: 'table',
      ...(app.xinMongo.createEnumAttributes([
        { label: 'Section分组', value: 'section_group', }, // 暂时先不用这个
        { label: '分组', value: 'group', },
        { label: '数据表', value: 'table', },
        { label: '流程表', value: 'workflow', },
        { label: '画面', value: 'screen', },
      ])),
    },
    sort: {
      title: '菜单排序',
      type: Number,
      default: 1,
    },

    // 数据表
    table_id: {
      title: '数据表ID',
      type: app.mongoose.Schema.Types.ObjectId,
    },
    table_settings: {
      attributes: {
        title: '表显示设置，无代码表显示设置',
        type: app.mongoose.Schema.Types.Mixed,
        default: () => ({}),
      },
    },

    screen_id: {
      title: '画面ID',
      type: app.mongoose.Schema.Types.ObjectId,
    },
    dashboard_id: {
      title: '仪表盘ID',
      type: app.mongoose.Schema.Types.ObjectId,
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

  Schema.virtual('tableInfo', {
    ref: 'xin_table',
    localField: 'table_id',
    foreignField: '_id',
    justOne: true,
  })

  return app.mongoose.model(CONFIG.modelName, Schema, CONFIG.modelName)
}
