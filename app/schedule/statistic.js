
const BaseSchedule = require('../core/baseSchedule')
const nodetools = require('@xinserver/tools/lib/node')
const mongoose = require('mongoose')

class XinSchedule extends BaseSchedule {
  // 通过 schedule 属性来设置定时任务的执行间隔等配置
  static get schedule () {
    return {
      cron: '0 10 0 * * *',
      cronOptions: {
        tz: 'Asia/ShangHai', // 设置时区
      },
      type: 'worker',
      immediate: false, // 启动时自动执行一次
      disable: process.env.NODE_ENV === 'development',
      // disable: true,
    }
  }

  // subscribe 是真正定时任务执行时被运行的函数
  async subscribe () {
    console.log('【定时任务 - 统计】开始执行')
    console.time('triggerTimeXinStatistic')
    
    await this.main()

    console.log('【定时任务 - 统计】执行结束，结束时间：' + this.app.dayjs.tz().format('YYYY-MM-DD HH:mm:ss'))
    console.timeEnd('triggerTimeXinStatistic')
  }

  main () {
    return new Promise(async (resolve, reject) => {
      // 项目列表
      const projectList = await this.app.models.xin_project.Model.find({ status: true, }).select({_id: 1, name: 1, system_admin_user_id: 1, control_statistic_time: 1,}).lean().exec()

      const statisticList = []
      const day_timestamp = this.app.dayjs.tz().add(-1, 'day').startOf('day').valueOf()

      for (let i = 0; i < projectList.length; i++) {
        const projectInfo = projectList[i]
        const project_id = projectInfo?._id

        if (day_timestamp === projectInfo?.control_statistic_time) continue
        // 获取数据表列表
        const tableList = await this.app.models.xin_table.Model.find({ status: true, project_id, }).select({_id: 1, name: 1, tablename: 1, project_id: 1,}).lean().exec()

        let table_list = []
        for (let i = 0; i < tableList.length; i++) {
          const tableInfo = tableList[i]
          const table_id = tableInfo?._id

          // 自定义表Schema创建
          const XinTable = this.app.models[table_id] || {}

          const countRes = await XinTable.Model.countDocuments({}).exec()
          table_list.push({
            name: tableInfo.name,
            tablename: tableInfo.tablename,
            table_id,
            table_record_number: countRes || 0,
          })
        }
        // 用户数
        const userRes = await this.app.models.xin_user.Model.countDocuments({ status: true, usertype: 'outside', project_id, }).exec()
        
        // 日志数
        const logRes = await this.app.models.xin_log.Model.countDocuments({ status: true, project_id, }).exec()

        // 消息数
        const messageRes = await this.app.models.xin_message.Model.countDocuments({ status: true, project_id, }).exec()

        const statisticInfo = {
          statistic_level: 'day',
          date: this.app.dayjs.tz(day_timestamp).format('YYYY-MM-DD'),
          date_timestamp: day_timestamp,
          table_number: tableList.length,
          table_record_number: table_list.map(a => a.table_record_number).reduce((a, b) => a + b, 0),
          table_list,
          user_number: userRes || 0,
          log_number: logRes || 0,
          message_number: messageRes || 0,

          create_user_id: projectInfo?.system_admin_user_id,
          project_id,
        }

        statisticList.push(statisticInfo)
      }

      console.log('---statisticList---', statisticList)
      // 保存到统计数据表
      if (statisticList.length) {
        await this.app.models.xin_statistic.Model.create(statisticList)
        await this.app.models.xin_project.Model.updateMany({ control_statistic_time: day_timestamp, }).exec()
      }

      resolve({ statisticList, })
    })
  }
}

module.exports = XinSchedule
