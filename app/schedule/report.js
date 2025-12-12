
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
    console.log('【定时任务 - 报表】开始执行')
    console.time('triggerTimeReport')
    
    await this.main()

    console.log('【定时任务 - 报表】执行结束，结束时间：' + this.app.dayjs.tz().format('YYYY-MM-DD HH:mm:ss'))
    console.timeEnd('triggerTimeReport')
  }

  main () {
    return new Promise(async (resolve, reject) => {
      
      const reportList = await this.app.models.xin_report.Model.find({ state: 0, status: true, })

      const statisticList = []

      for (let i = 0; i < reportList.length; i++) {
        const reportInfo = reportList[i]
        const moduleData = reportInfo?.body
        const startTime = this.app.dayjs.tz().startOf(reportInfo.cycle).add(-1, reportInfo.cycle).valueOf()

        // 查询记录是否已存在
        const record_number = await this.app.models.xin_report_record.Model.countDocuments({
          project_id: reportInfo.project_id,
          report_id: reportInfo._id,
          cycle: reportInfo.cycle,
          date_timestamp: startTime,
        }).exec()
        if (!!record_number) continue

        const reportViewInfo = await this.service.report.view.detail({ _id: reportInfo.report_view_id, })
        
        const resultList = []
        const moduleInfo = reportViewInfo?.body
        const table_id = moduleInfo?.data?.attributes?.tableInfo?._id
        const customMatchs = await conditionSdk.createSearchConditionFunc(moduleData?.filters, {})
        if (reportInfo.moduleType === 'huizong') {
          const params = await reportSdk.huizong.createSearchOption(moduleInfo, { customMatchs })
          // console.log('-----', JSON.stringify(params, null, 2))
          const data = await this.service.db.index.aggregate(params)
          resultList.push(...data)
        } else if (reportInfo.moduleType === 'mingxi') {
          const params = await reportSdk.mingxi.createSearchOption(moduleInfo, { customMatchs })
          // console.log('-----', JSON.stringify(params, null, 2))
          const data = await this.service.db.index.model(params)
          resultList.push(...data)
        }
        let title
        if (reportInfo.cycle === 'day') {
          title = '[日报] ' + this.app.dayjs.tz(startTime).format('YYYY-MM-DD')
        } else if (reportInfo.cycle === 'week') {
          title = '[周报] ' + this.app.dayjs.tz(startTime).format('YYYY年 第w周')
        } else if (reportInfo.cycle === 'month') {
          title = '[月报] ' + this.app.dayjs.tz(startTime).format('YYYY年 MM月')
        } else if (reportInfo.cycle === 'quarter') {
          title = '[季度报] ' + `${this.app.dayjs.tz(startTime).format('YYYY年')} ${this.app.dayjs.tz(startTime).quarter()}季度`
        } else if (reportInfo.cycle === 'year') {
          title = '[年报] ' + this.app.dayjs.tz(startTime).format('YYYY年')
        }
        statisticList.push({
          report_id: reportInfo._id,
          cycle: reportInfo.cycle,
          title,
          date: this.app.dayjs.tz(startTime).format('YYYY-MM-DD'),
          date_timestamp: startTime,
          body: resultList,
          project_id: reportInfo.project_id,
        })
      }
      // 保存到统计数据表
      if (statisticList.length) {
        await this.app.models.xin_report_record.Model.insertMany(statisticList)
      }

      console.log('----statisticList----', statisticList)
      resolve({ statisticList, })
    })
  }
}

module.exports = XinSchedule
