

const CONFIG = {
  modelName: 'xin_statistic', // 模型名称
  tableName: '系统统计表', // 表名称
  ispublic: false, // 是否公开
}

module.exports = (app) => {

  const Schema = new app.mongoose.Schema({
    ...(app.xinMongo.createCommonBeforeFields(CONFIG)),

    statistic_level: {
      title: '统计维度',
      type: String,
      trim: true,
      ...(app.xinMongo.createEnumAttributes([
        { label: '每日', value: 'day', },
        { label: '每周', value: 'week', },
        { label: '每月', value: 'month', },
        { label: '每年', value: 'year', },
      ])),
      default: 'day',
    },
    date: {
      title: '日期',
      type: String,
      trim: true,
    },
    date_timestamp: {
      title: '日期时间戳',
      type: Number,
    },
    table_number: {
      title: '数据表总数',
      type: Number,
    },
    table_record_number: {
      title: '数据总数',
      type: Number,
    },
    table_list: {
      title: '数据表详细情况',
      type: Array,
    },
    user_number: {
      title: '用户总数',
      type: Number,
    },
    log_number: {
      title: '日志总数',
      type: Number,
    },
    message_number: {
      title: '消息总数',
      type: Number,
    },

    ...(app.xinMongo.createCommonAfterFields(CONFIG)),
  },
  {
    ...(app.xinMongo.createCommonOptions(CONFIG)),
  })

  app.xinMongo.createCommonIndexs(CONFIG, Schema)
  Schema.index({ statistic_level: 1, })
  Schema.index({ date: 1, })
  Schema.index({ date: 1, statistic_level: 1, }, { unique: true, })

  app.xinMongo.createCommonVirtuals(CONFIG, Schema)

  return app.mongoose.model(CONFIG.modelName, Schema, CONFIG.modelName)
}
