// 业务相关的一些操作
const BaseSchedule = require('../core/baseSchedule')
const nodetools = require('@xinserver/tools/lib/node')

class XinSchedule extends BaseSchedule {
  // 通过 schedule 属性来设置定时任务的执行间隔等配置
  static get schedule () {
    return {
      cron: '0 0 0 * * *',
      cronOptions: {
        tz: 'Asia/ShangHai', // 设置时区
      },
      type: 'worker',
      immediate: false, // 启动时自动执行一次
      disable: process.env.NODE_ENV === 'development',
    }
  }

  // subscribe 是真正定时任务执行时被运行的函数
  async subscribe () {
    console.log('【定时任务 - 每日数据更新】开始执行')
    console.time('triggerTimeMessage')
    
    await this.main()

    console.log('【定时任务 - 每日数据更新】执行结束，结束时间：' + this.app.dayjs.tz().format('YYYY-MM-DD HH:mm:ss'))
    console.timeEnd('triggerTimeMessage')
  }

  main () {
    return new Promise(async (resolve, reject) => {
      // 项目列表
      await this.app.models.xin_hook.Model.findOneAndUpdate({
        type: 'unique_id',
        status: true,
      }, {
        unique_id: 1000,
      }, {
        new: true,
      })
      const result = {}
      // 清理掉历史老数据
      // xin_statistic统计表
      const xin_statisticRes = await this.app.models.xin_statistic.Model.deleteMany({
        create_time: { $lt: this.app.dayjs.tz().startOf('day').add(-180, 'day').valueOf(), },
      }).exec()
      // xin_log日志表
      const xin_logRes = await this.app.models.xin_log.Model.deleteMany({
        create_time: { $lt: this.app.dayjs.tz().startOf('day').add(-180, 'day').valueOf(), },
      }).exec()
      // xin_workflow_record流程记录表
      const xin_workflow_recordRes = await this.app.models.xin_workflow_record.Model.deleteMany({
        create_time: { $lt: this.app.dayjs.tz().startOf('day').add(-30, 'day').valueOf(), },
      }).exec()
      // workflow_record_log流程记录日志表 - 清理掉比较重的字段
      const workflow_record_logRes = await this.app.models.workflow_record_log.Model.updateMany({
        create_time: { $lt: this.app.dayjs.tz().startOf('day').add(-90, 'day').valueOf(), },
      }, {
        $set: { current_module: null }
      }).exec()

      // 其它业务不相关的
      // xin_redis表
      const xin_redisRes = await this.app.models.xin_redis.Model.deleteMany({
        create_time: { $lt: this.app.dayjs.tz().startOf('day').add(-180, 'day').valueOf(), },
      }).exec()
      // xin_token_black表
      const xin_token_blackRes = await this.app.models.xin_token_black.Model.deleteMany({
        create_time: { $lt: this.app.dayjs.tz().startOf('day').add(-180, 'day').valueOf(), },
      }).exec()
      // xin_wx表
      const xin_wxRes = await this.app.models.xin_wx.Model.deleteMany({
        create_time: { $lt: this.app.dayjs.tz().startOf('day').add(-30, 'day').valueOf(), },
      }).exec()

      result.xin_statistic = xin_statisticRes
      result.xin_log = xin_logRes
      result.xin_workflow_record = xin_workflow_recordRes
      result.workflow_record_log = workflow_record_logRes
      result.xin_redis = xin_redisRes
      result.xin_token_black = xin_token_blackRes
      result.xin_wx = xin_wxRes

      resolve(result)
    })
  }
}

module.exports = XinSchedule
