
const BaseSchedule = require('../core/baseSchedule')
const nodetools = require('@xinserver/tools/lib/node')

class XinSchedule extends BaseSchedule {
  // 通过 schedule 属性来设置定时任务的执行间隔等配置
  static get schedule () {
    return {
      cron: '0 */30 * * * *',
      cronOptions: {
        tz: 'Asia/ShangHai', // 设置时区
      },
      type: 'worker',
      immediate: false, // 启动时自动执行一次
      disable: process.env.NODE_ENV === 'development',
      // disable: false,
    }
  }

  // subscribe 是真正定时任务执行时被运行的函数
  async subscribe () {
    console.log('【定时任务 - 微信】开始执行')
    console.time('triggerTimeWx')
    // await this.main()
    // if (process.env.NODE_ENV !== 'development') {
      await this.main()
    // }

    console.log('【定时任务 - 微信】执行结束，结束时间：' + this.app.dayjs.tz().format('YYYY-MM-DD HH:mm:ss'))
    console.timeEnd('triggerTimeWx')
  }

  main () {
    return new Promise(async (resolve, reject) => {
      // 获取微信服务号配置信息
      const options = await this.service.system.option.detail({ key: this.xinConfig.keys.wx_mp_service_key, })
      if (!options) {
        console.log('刷新AccessToken: 失败！原因：尚未配置微信信息')
        resolve()
        return
      }
      // 刷新 AccessToken
      const result = await this.ctx.service.server.wx.refreshAccessToken()
  
      console.log('刷新AccessToken: ' + (result ? '成功' : '失败'))
      resolve(result)
    })
  }
}

module.exports = XinSchedule