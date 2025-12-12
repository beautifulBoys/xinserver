
'use strict';

const BaseController = require('../../core/baseController')
const tableSdk = require('../../sdk/table')
const workflowSdk = require('../../sdk/workflow')

class XinController extends BaseController {

  async list () {
    const bodyData = this.ctx.request.body || {}

    const result = await this.service.nocode.appmenu.list(bodyData)

    this.ctx.body = this.app.xinError.success(result)
  }

  async add () {
    const bodyData = this.ctx.request.body || {}

    let result
    if (bodyData.type === 'table' || bodyData.type === 'workflow') {
      // 创建数据表
      const tableInfo = await this.service.table.main.add({
        name: bodyData.name || '未命名',
        type: bodyData.type || 'table',
        comment: '无代码应用创建',
      })
      // 创建菜单
      result = await this.service.nocode.appmenu.add({
        ...(bodyData || {}),
        table_id: tableInfo._id,
      })
    } else if (bodyData.type === 'dashboard') {
      
    } else if (bodyData.type === 'screen') {
      
    } else {
      // 创建菜单
      result = await this.service.nocode.appmenu.add(bodyData)
    }

    this.ctx.body = this.app.xinError.success(result)
  }

  async update () {
    const bodyData = this.ctx.request.body || {}
		const filter = bodyData.filter || {}
		const data = bodyData.data || {}

    const _id = filter._id

    const appMenuInfo = await this.service.nocode.appmenu.detail(filter)
    // console.log('-----appMenuInfo----', appMenuInfo)
    if (appMenuInfo.type === 'table' || appMenuInfo.type === 'workflow') {
      // 修改数据表信息
      if (data.name) {
        await this.service.table.main.update({ filter: { _id: appMenuInfo.table_id }, data: {
          name: data.name || '未命名',
        }, })
      }
    } else if (appMenuInfo.type === 'dashboard') {
      
    } else if (appMenuInfo.type === 'screen') {
      
    }

    const result = await this.service.nocode.appmenu.update({ filter: { _id, }, data, })

    this.ctx.body = this.app.xinError.success(result)
  }

  async batchUpdate () {
    const bodyData = this.ctx.request.body || {}
    const filter = bodyData.filter || {}
    const data = bodyData.data || {}

    const result = await this.service.nocode.appmenu.batchUpdate({ filter, data, })

    this.ctx.body = this.app.xinError.success(result)
  }

  async createWorkflow () {
    const bodyData = this.ctx.request.body || {}

    const tableInfo = await this.service.table.main.detail({ _id: bodyData.table_id, })
    const body = await workflowSdk.createWorkflowDataFunc(tableInfo)
    const workflowInfo = await this.service.workflow.main.add({
      name: `${tableInfo?.name}-新增`,
      table_id: tableInfo?._id,
      workflow_type: 'table_record_add',
      body,
      comment: '无代码应用创建',
    })
    // console.log('---workflowInfo---', tableInfo._id, workflowInfo._id)
    const result = await this.service.table.main.update({ filter: { _id: tableInfo?._id }, data: {
      'workflow_settings.create': workflowInfo?._id,
    }, })

    this.ctx.body = this.app.xinError.success(result)
  }

  async detail () {
    const bodyData = this.ctx.request.body || {}
		const filter = bodyData || {}

    const result = await this.service.nocode.appmenu.detail(filter)

    this.ctx.body = this.app.xinError.success(result)
  }

  async delete () {
    const bodyData = this.ctx.request.body || {}
		const filter = bodyData || {}

    const appmenuInfo = await this.service.nocode.appmenu.detail(filter)

    const [ result ] = await Promise.all([
      this.service.nocode.appmenu.delete(filter),
      appmenuInfo.table_id && this.service.table.main.delete({ _id: appmenuInfo.table_id, }),
    ].filter(Boolean))

    this.ctx.body = this.app.xinError.success(result)
  }

  async batchDelete () {
    const bodyData = this.ctx.request.body || {}
    const filter = bodyData || {}

    const result = await this.service.nocode.appmenu.batchDelete(filter)

    this.ctx.body = this.app.xinError.success(result)
  }

}

module.exports = XinController
