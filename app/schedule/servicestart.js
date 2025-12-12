// 业务相关的一些操作
const BaseSchedule = require('../core/baseSchedule')
const nodetools = require('@xinserver/tools/lib/node')

class XinSchedule extends BaseSchedule {
  // 通过 schedule 属性来设置定时任务的执行间隔等配置
  static get schedule () {
    return {
      // cron: '0 0 0 * * *',
      // cronOptions: {
      //   tz: 'Asia/ShangHai', // 设置时区
      // },
      type: 'worker',
      immediate: true, // 启动时自动执行一次
      // disable: process.env.NODE_ENV === 'development',
      disable: false,
    }
  }

  // subscribe 是真正定时任务执行时被运行的函数
  async subscribe () {
    await this.main()
  }

  main () {
    return new Promise(async (resolve, reject) => {
      // 项目列表
      await this.service.devops.docker.server_start_time()
      resolve()
    })
  }
}

module.exports = XinSchedule
