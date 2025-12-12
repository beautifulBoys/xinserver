'use strict';

const BaseService = require('../../core/baseService')
const schedule = require('node-schedule')

const scheduleMaps = {}

// 此文件内仅包含定时任务的情况
class XinService extends BaseService {

  // 启动一个定时任务，把之前的删掉，相当于restratOne
  async startOne (workflowInfo) {
    const token_user_id = this.ctx.xinToken?.user_id || undefined

    const _this = this
    const startModuleInfo = workflowInfo?.body?.customData?.branchs?.[0]?.[1]
    const attributes = startModuleInfo?.data?.attributes || {}

    // 取消之前的任务
    if (scheduleMaps[workflowInfo._id]) {
      scheduleMaps[workflowInfo._id].cancel?.()
      delete scheduleMaps[workflowInfo._id]
    }

    console.log('单流程已启用：', workflowInfo._id)

    // 重新启动定时任务
    scheduleMaps[workflowInfo._id] = schedule.scheduleJob({
      rule: attributes.type === 'once' ? new Date(attributes.time) : attributes.cron,
      tz: 'Asia/Shanghai',
      start: workflowInfo.start_time ? new Date(workflowInfo.start_time) : undefined,
      end: workflowInfo.end_time ? new Date(workflowInfo.end_time) : undefined,
    }, async function (data) {
      // console.log('----定时任务：', this.app.dayjs.tz().format('YYYY-MM-DD HH:mm:ss'), attributes.cron || attributes.time)
      const res = await _this.service.workflow.record.addScheduleWorkflow(data)
      if (res) { // 代表定时任务执行成功
        if (data.attributes?.type === 'once') { // 单次任务
          await _this.service.workflow.main.update({ filter: { _id: data.workflowInfo?._id, }, data: {
            alive: false,
          }, })
          await _this.service.common.schedule.deleteOne(data.workflowInfo)
        }
      }
    }.bind(null, {
      workflowInfo,
      project_id: workflowInfo?.project_id,
      attributes,
      // token_user_id,
    }))

    return true
  }

  // 拉起所有定时任务，之前如果有就删掉。
  async startAll () {
    // const token_user_id = this.ctx.xinToken?.user_id || undefined

    const _this = this
    const { data: workflowList } = await this.service.workflow.main.allScheduleList({})

    for (let i = 0; i < workflowList.length; i++) {
      const workflowInfo = workflowList[i]

      const startModuleInfo = workflowInfo?.body?.customData?.branchs?.[0]?.[1]
      const attributes = startModuleInfo?.data?.attributes || {}
      // 取消之前的任务
      if (scheduleMaps[workflowInfo._id]) {
        scheduleMaps[workflowInfo._id].cancel?.()
        delete scheduleMaps[workflowInfo._id]
      }

      // 重新启动定时任务
      scheduleMaps[workflowInfo._id] = schedule.scheduleJob({
        rule: attributes.type === 'once' ? new Date(attributes.time) : attributes.cron,
        tz: 'Asia/Shanghai',
        start: workflowInfo.start_time ? new Date(workflowInfo.start_time) : undefined,
        end: workflowInfo.end_time ? new Date(workflowInfo.end_time) : undefined,
      }, async function (data) {
        // console.log('----定时任务：', this.app.dayjs.tz().format('YYYY-MM-DD HH:mm:ss'), attributes.cron || attributes.time)
        const res = await _this.service.workflow.record.addScheduleWorkflow(data)
        if (res) { // 代表定时任务执行成功
          if (data.attributes?.type === 'once') { // 单次任务
            await _this.service.workflow.main.update({ filter: { _id: data.workflowInfo?._id, }, data: {
              alive: false,
            }, })
            await _this.service.common.schedule.deleteOne(data.workflowInfo)
          }
        }
      }.bind(null, {
        workflowInfo,
        project_id: workflowInfo?.project_id,
        attributes,
        // token_user_id,
      }))
    }

    console.log('定时任务已全部启动: ', workflowList.map(a => a._id), Object.keys(scheduleMaps))

    return true
  }

  // 删除一个定时任务
  async deleteOne (workflowInfo) {
    const token_user_id = this.ctx.xinToken?.user_id || undefined

    // 取消之前的任务
    if (scheduleMaps[workflowInfo._id]) {
      scheduleMaps[workflowInfo._id]?.cancel?.()
      delete scheduleMaps[workflowInfo._id]
    }
    console.log('单流程已移除：', workflowInfo._id)

    return true
  }

  // 删除所有定时任务
  async deleteAll () {
    const token_user_id = this.ctx.xinToken?.user_id || undefined

    const workflow_ids = Object.keys(scheduleMaps)
    for (let i = 0; i < workflow_ids.length; i++) {
      const workflow_id = workflow_ids[i]
      // 取消之前的任务
      if (scheduleMaps[workflow_id]) {
        scheduleMaps[workflow_id]?.cancel?.()
        delete scheduleMaps[workflow_id]
      }
    }

    console.log('全部流程已移除：', workflow_ids)

    return true
  }
}

module.exports = XinService
