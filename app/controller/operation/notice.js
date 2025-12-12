
'use strict';

const BaseController = require('../../core/baseController')
const path = require('path')

class XinController extends BaseController {

  async list () {
    const bodyData = this.ctx.request.body || {}

    const result = await this.service.operation.notice.list(bodyData)

    this.ctx.body = this.app.xinError.success(result)
  }

  async add () {
    const bodyData = this.ctx.request.body || {}

    const result = await this.service.operation.notice.add(bodyData)
		// 日志记录
		await this.service.log.main.add({ type: 'operation_notice_add', result: result?._id, })

    this.ctx.body = this.app.xinError.success(result)
  }

  async update () {
    const bodyData = this.ctx.request.body || {}
		const filter = bodyData.filter || {}
		const data = bodyData.data || {}

    const result = await this.service.operation.notice.update({ filter, data, })
		// 日志记录
		await this.service.log.main.add({ type: 'operation_notice_update', result, })

    this.ctx.body = this.app.xinError.success(result)
  }

  async read () {
    const bodyData = this.ctx.request.body || {}

    const _id = bodyData._id
    delete bodyData._id
    const result = await this.service.operation.notice.read(_id)

    this.ctx.body = this.app.xinError.success(result)
  }

  async batchUpdate () {
    const bodyData = this.ctx.request.body || {}
    const filter = bodyData.filter || {}
    const data = bodyData.data || {}

    const result = await this.service.operation.notice.batchUpdate({ filter, data, })
		// 日志记录
		await this.service.log.main.add({ type: 'operation_notice_batchUpdate', result, })

    this.ctx.body = this.app.xinError.success(result)
  }

  async detail () {
    const bodyData = this.ctx.request.body || {}
		const filter = bodyData || {}

    const result = await this.service.operation.notice.detail(filter)

    this.ctx.body = this.app.xinError.success(result)
  }

  async delete () {
    const bodyData = this.ctx.request.body || {}
		const filter = bodyData || {}

    const result = await this.service.operation.notice.delete(filter)
		// 日志记录
		await this.service.log.main.add({ type: 'operation_notice_delete', result: result?._id, })

    this.ctx.body = this.app.xinError.success(result)
  }

  async batchDelete () {
    const bodyData = this.ctx.request.body || {}
    const filter = bodyData || {}

    const result = await this.service.operation.notice.batchDelete(filter)
		// 日志记录
		await this.service.log.main.add({ type: 'operation_notice_batchDelete', result, })

    this.ctx.body = this.app.xinError.success(result)
  }
}

module.exports = XinController
