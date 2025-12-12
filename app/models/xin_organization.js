

const CONFIG = {
  modelName: 'xin_organization', // 模型名称
  tableName: '组织机构表', // 表名称
  ispublic: true, // 是否公开
}

module.exports = (app) => {

  const Schema = new app.mongoose.Schema({
    ...(app.xinMongo.createCommonBeforeFields(CONFIG)),

    name: {
      title: '部门名称',
      type: String,
      trim: true,
    },
    is_root: {
      title: '是否是根组织',
      type: Boolean,
      default: false,
    },
    parent_id: {
      title: '上级部门ID',
      type: app.mongoose.Schema.Types.ObjectId,
    },
    type: {
      title: '类型',
      type: String,
      trim: true,
      default: 'organization',
      ...(app.xinMongo.createEnumAttributes([
        { label: '团队/部门', value: 'organization', },
        { label: '公司', value: 'company', },
      ])),
    },
    sort: {
      title: '排序',
      type: Number,
      default: 0,
    },
    state: {
      title: '状态',
      type: String,
      trim: true,
      default: 'ok',
      ...(app.xinMongo.createEnumAttributes([
        { label: '正常', value: 'ok', },
        { label: '解散', value: 'disband', },
        { label: '合并', value: 'merge', },
      ])),
    },
    manager_user_id: {
      title: '主管',
      type: app.mongoose.Schema.Types.ObjectId,
    },
    description: {
      title: '部门简介',
      type: String,
      trim: true,
    },
    mobile: {
      title: '部门电话',
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

  Schema.virtual('parentInfo', {
    ref: 'xin_organization',
    localField: 'parent_id',
    foreignField: '_id',
    justOne: true,
  })

  Schema.virtual('managerUserInfo', {
    ref: 'xin_user',
    localField: 'manager_user_id',
    foreignField: '_id',
    justOne: true,
  })

  return app.mongoose.model(CONFIG.modelName, Schema, CONFIG.modelName)
}
