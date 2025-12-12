

const CONFIG = {
  modelName: 'xin_user', // 模型名称
  tableName: '用户表', // 表名称
  ispublic: true, // 是否公开
}

module.exports = (app) => {

  const Schema = new app.mongoose.Schema({
    ...(app.xinMongo.createCommonBeforeFields(CONFIG)),

    usertype: {
      title: '用户类型',
      type: String,
      ...(app.xinMongo.createEnumAttributes([
        { label: '内部用户', value: 'inside', },
        { label: '外部用户', value: 'outside', },
      ])),
      default: 'outside',
    },
    name: {
      title: '姓名',
      type: String,
      trim: true,
    },
    username: {
      title: '用户名',
      type: String,
      trim: true,
    },
    nickname: {
      title: '昵称',
      type: String,
      trim: true,
    },
    avatar: {
      title: '头像',
      type: app.mongoose.Schema.Types.Mixed,
    },
    password: {
      title: '密码',
      type: String,
      trim: true,
    },
    auto_login: {
      title: '是否自动登录',
      type: Boolean,
      default: false,
    },
    position: {
      title: '职位/职务',
      type: String,
    },
    is_admin: {
      title: '是否是管理员',
      type: Boolean,
      default: false,
    },
    is_super_admin: {
      title: '是否是超级管理员',
      type: Boolean,
      default: false,
    },
    is_system_admin: {
      title: '是否是系统管理员',
      type: Boolean,
      default: false,
    },
    organizations: [{
      title: '所属部门',
      type: app.mongoose.Schema.Types.ObjectId,
    }],
    roles: [{
      title: '角色',
      type: String,
    }],
    tags: [{
      title: '用户标签',
      type: app.mongoose.Schema.Types.ObjectId,
    }],
    gender: {
      title: '性别',
      type: Number,
      default: 0,
      ...(app.xinMongo.createEnumAttributes([
        { label: '未知', value: 0, },
        { label: '男', value: 1, },
        { label: '女', value: 2, },
      ])),
    },
    phone: { // 暂时没用到
      title: '办公电话',
      type: String,
      trim: true,
    },
    mobile: {
      title: '手机号',
      type: String,
      trim: true,
    },
    email: {
      title: '电子邮箱',
      type: String,
      trim: true,
    },
    job_no: {
      title: '工号',
      type: String,
      trim: true,
      default: '10001',
    },

    wechat: {
      title: '微信号',
      type: String,
      trim: true,
    },
    qq: {
      title: 'QQ号',
      type: String,
      trim: true,
    },
    wx_openid: {
      title: '微信OpenID',
      type: String,
      trim: true,
    },
    wx_unionid: {
      title: '微信UnionID',
      type: String,
      trim: true,
    },

    token: {
      title: 'Token',
      type: Array,
    },
    state: {
      title: '用户状态',
      type: Number,
      ...(app.xinMongo.createEnumAttributes([
        // { label: '待激活', value: -1, },
        { label: '启用', value: 0, },
        { label: '禁用', value: 1, },
        { label: '审核中', value: 2, }, // 暂时没用到
        { label: '审核拒绝', value: 3, }, // 暂时没用到
        { label: '系统内置', value: 100, desc: '如系统账号，不让显示到列表里面', },
      ])),
      default: 0,
    },

    ...(app.xinMongo.createCommonAfterFields(CONFIG)),
  },
  {
    ...(app.xinMongo.createCommonOptions(CONFIG)),
  })

  app.xinMongo.createCommonIndexs(CONFIG, Schema)
  Schema.index({ name: 1, })
  Schema.index({ mobile: 1, }, { 
    unique: true, 
    partialFilterExpression: { mobile: { $exists: true } }
  })
  Schema.index({ username: 1, }, { 
    unique: true, 
    partialFilterExpression: { username: { $exists: true } }
  })
  Schema.index({ email: 1, }, { 
    unique: true, 
    partialFilterExpression: { email: { $exists: true } }
  })

  app.xinMongo.createCommonVirtuals(CONFIG, Schema)

  Schema.virtual('roleInfos', {
    ref: 'xin_user_role',
    localField: 'roles',
    foreignField: 'value',
    justOne: false,
  })

  Schema.virtual('tagInfos', {
    ref: 'xin_user_tag',
    localField: 'tags',
    foreignField: '_id',
    justOne: false,
  })

  Schema.virtual('organizationInfos', {
    ref: 'xin_organization',
    localField: 'organizations',
    foreignField: '_id',
    justOne: false,
  })

  return app.mongoose.model(CONFIG.modelName, Schema, CONFIG.modelName)
}
