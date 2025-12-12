
'use strict';

const BaseController = require('../../core/baseController')
const path = require('path')

class XinController extends BaseController {

  async list () {
    const bodyData = this.ctx.request.body || {}

    const result = await this.service.operation.message.list(bodyData)

    this.ctx.body = this.app.xinError.success(result)
  }

  async add () {
    const bodyData = this.ctx.request.body || {}

    const result = await this.service.operation.message.add(bodyData)
    const detailInfo = await this.service.operation.message.detail({ _id: result._id })
    const projectInfo = await this.service.system.project.getAccount()

    const users = Array.from(new Set(detailInfo.targets || []))

    const messages = users.map(user_id => ({
      type: detailInfo?.classifyInfo?.name,
      title: detailInfo?.title,
      content: detailInfo?.html,
      body: detailInfo?.body,
      receive_user_id: user_id,
      tags: detailInfo?.tagInfos?.map(a => a.name),
      create_user_id: projectInfo?.system_admin_user_id,
    }))

    const res = await this.service.message.main.create(messages)

		// 日志记录
		await this.service.log.main.add({ type: 'operation_message_add', result: result?._id, })

    this.ctx.body = this.app.xinError.success(result)
  }

  async update () {
    const bodyData = this.ctx.request.body || {}
		const filter = bodyData.filter || {}
		const data = bodyData.data || {}

    const result = await this.service.operation.message.update({ filter, data, })
		// 日志记录
		await this.service.log.main.add({ type: 'operation_message_update', result, })

    this.ctx.body = this.app.xinError.success(result)
  }

  async batchUpdate () {
    const bodyData = this.ctx.request.body || {}
    const filter = bodyData.filter || {}
    const data = bodyData.data || {}

    const result = await this.service.operation.message.batchUpdate({ filter, data, })
		// 日志记录
		await this.service.log.main.add({ type: 'operation_message_batchUpdate', result, })

    this.ctx.body = this.app.xinError.success(result)
  }

  async detail () {
    const bodyData = this.ctx.request.body || {}
		const filter = bodyData || {}

    const result = await this.service.operation.message.detail(filter)

    this.ctx.body = this.app.xinError.success(result)
  }

  async delete () {
    const bodyData = this.ctx.request.body || {}
		const filter = bodyData || {}

    const result = await this.service.operation.message.delete(filter)
		// 日志记录
		await this.service.log.main.add({ type: 'operation_message_delete', result: result?._id, })

    this.ctx.body = this.app.xinError.success(result)
  }

  async batchDelete () {
    const bodyData = this.ctx.request.body || {}
    const filter = bodyData || {}

    const result = await this.service.operation.message.batchDelete(filter)
		// 日志记录
		await this.service.log.main.add({ type: 'operation_message_batchDelete', result, })

    this.ctx.body = this.app.xinError.success(result)
  }
}

module.exports = XinController
