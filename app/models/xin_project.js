
const CONFIG = {
  modelName: 'xin_project', // 模型名称
  tableName: '项目表', // 表名称
  ispublic: false, // 是否公开
}
module.exports = (app) => {

  const Schema = new app.mongoose.Schema({
    ...(app.xinMongo.createCommonBeforeFields(CONFIG)),

    unique_id: {
      title: '唯一ID',
      type: String,
      trim: true,
      default: () => app.xin.uuid('', 6),
    },
    project_status: {
      title: '项目/空间状态。计算值，这里只做记录',
      type: String,
      trim: true,
      default: 'ok',
      ...(app.xinMongo.createEnumAttributes([
        { label: '状态正常', value: 'ok', },
        { label: '系统维护', value: 'system_repair', },
        { label: '违规封禁', value: 'closeby_rule', },
      ])),
    },
    license_status: { // 这个值似乎暂时没有用到，先去掉吧
      title: '项目/空间授权状态。计算值，这里只做记录',
      type: String,
      trim: true,
      ...(app.xinMongo.createEnumAttributes([
        { label: '状态正常', value: 'ok', },
        { label: '授权过期', value: 'license_expired', },
        { label: '授权不存在', value: 'license_empty', },
        { label: '授权错误', value: 'license_error', },
      ])),
    },
    lowcode_status: {
      title: '低代码授权状态。计算值，这里只做记录',
      type: String,
      trim: true,
      ...(app.xinMongo.createEnumAttributes([
        { label: '状态正常', value: 'ok', },
        { label: '授权过期', value: 'lowcode_expired', },
        { label: '未授权', value: 'lowcode_close', },
      ])),
    },
    name: {
      title: '项目名称',
      type: String,
      trim: true,
    },
    short_path: {
      title: '项目短路径标识: 不可重复',
      type: String,
      trim: true,
    },
    logo: {
      title: 'LOGO',
      type: app.mongoose.Schema.Types.Mixed,
    },
    description: {
      title: '项目描述',
      type: String,
      trim: true,
    },
    platform_type: {
      title: '平台类型',
      type: String,
      trim: true,
      default: 'nocode',
      ...(app.xinMongo.createEnumAttributes([
        { label: '无代码', value: 'nocode', },
        { label: '低代码', value: 'lowcode', },
      ])),
    },
    is_zone: {
      title: '是否是空间默认项目',
      type: Boolean,
      default: false,
    },
    front_routers: {
      title: '前台路由',
      type: Array,
    },
    admin_menus: {
      title: '系统菜单',
      type: Array,
    },
    dev_scripts: {
      title: '加载脚本文件',
      type: Array,
      default: [],
    },
    plugins: {
      title: '插件列表',
      type: app.mongoose.Schema.Types.Mixed,
      default: {},
    },
    system_account_token: {
      title: '系统账号Token',
      type: String,
      trim: true,
    },
    system_front_user_id: {
      title: '系统前台用户ID',
      type: app.mongoose.Schema.Types.ObjectId,
    },
    system_admin_user_id: {
      title: '系统后台用户ID',
      type: app.mongoose.Schema.Types.ObjectId,
    },

    control_statistic_time: {
      title: '上次统计时间戳(小于已统计，大于未统计)',
      type: Number,
      default: Date.now,
    },
    control_job_no: {
      title: '员工工号排序',
      type: Number,
      default: 10001,
    },

    ...(app.xinMongo.createCommonAfterFields(CONFIG)),
  },
  {
    ...(app.xinMongo.createCommonOptions(CONFIG)),
  })

  app.xinMongo.createCommonIndexs(CONFIG, Schema)
  Schema.index({ short_path: 1, }, {
    unique: true,
    partialFilterExpression: { value: { $exists: true } }
  })
  Schema.index({ unique_id: 1, }, { unique: true, })
  Schema.index({ name: 1, }, {})

  app.xinMongo.createCommonVirtuals(CONFIG, Schema)

  return app.mongoose.model(CONFIG.modelName, Schema, CONFIG.modelName)
}
