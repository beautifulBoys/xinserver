
'use strict';

const BaseController = require('../../core/baseController')
const path = require('path')

class XinController extends BaseController {

  async list () {
    const bodyData = this.ctx.request.body || {}

    const result = await this.service.message.reply.list(bodyData)

    this.ctx.body = this.app.xinError.success(result)
  }

  async add () {
    const bodyData = this.ctx.request.body || {}

    const result = await this.service.message.reply.add(bodyData)
		// 日志记录
		await this.service.log.main.add({ type: 'message_reply_add', result: result?._id, })

    this.ctx.body = this.app.xinError.success(result)
  }

  async update () {
    const bodyData = this.ctx.request.body || {}
		const filter = bodyData.filter || {}
		const data = bodyData.data || {}

    const result = await this.service.message.reply.update({ filter, data, })
		// 日志记录
		await this.service.log.main.add({ type: 'message_reply_update', result, })

    this.ctx.body = this.app.xinError.success(result)
  }

  async batchUpdate () {
    const bodyData = this.ctx.request.body || {}
    const filter = bodyData.filter || {}
    const data = bodyData.data || {}

    const result = await this.service.message.reply.batchUpdate({ filter, data, })
		// 日志记录
		await this.service.log.main.add({ type: 'message_reply_batchUpdate', result, })

    this.ctx.body = this.app.xinError.success(result)
  }

  async detail () {
    const bodyData = this.ctx.request.body || {}
		const filter = bodyData || {}

    const result = await this.service.message.reply.detail(filter)

    this.ctx.body = this.app.xinError.success(result)
  }

  async delete () {
    const bodyData = this.ctx.request.body || {}
		const filter = bodyData || {}

    const result = await this.service.message.reply.delete(filter)
		// 日志记录
		await this.service.log.main.add({ type: 'message_reply_delete', result: result?._id, })

    this.ctx.body = this.app.xinError.success(result)
  }

  async batchDelete () {
    const bodyData = this.ctx.request.body || {}
    const filter = bodyData || {}

    const result = await this.service.message.reply.batchDelete(filter)
		// 日志记录
		await this.service.log.main.add({ type: 'message_reply_batchDelete', result, })

    this.ctx.body = this.app.xinError.success(result)
  }

}

module.exports = XinController
