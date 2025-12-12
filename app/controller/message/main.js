
'use strict';

const BaseController = require('../../core/baseController')
const path = require('path')

class XinController extends BaseController {

  async list () {
    const bodyData = this.ctx.request.body || {}

    const result = await this.service.message.main.list(bodyData)

    this.ctx.body = this.app.xinError.success(result)
  }

  async count () {
    const bodyData = this.ctx.request.body || {}
		const filter = bodyData || {}

    const result = await this.service.message.main.count(filter)

    this.ctx.body = this.app.xinError.success(result)
  }

  async add () {
    const bodyData = this.ctx.request.body || {}

    const result = await this.service.message.main.add(bodyData)
		// 日志记录
		await this.service.log.main.add({ type: 'message_add', result: result?._id, })

    this.ctx.body = this.app.xinError.success(result)
  }

  async update () {
    const bodyData = this.ctx.request.body || {}
		const filter = bodyData.filter || {}
		const data = bodyData.data || {}

    const result = await this.service.message.main.update({ filter, data, })
		// 日志记录
		await this.service.log.main.add({ type: 'message_update', result, })

    this.ctx.body = this.app.xinError.success(result)
  }

  async batchUpdate () {
    const bodyData = this.ctx.request.body || {}
    const filter = bodyData.filter || {}
    const data = bodyData.data || {}

    const result = await this.service.message.main.batchUpdate({ filter, data, })
		// 日志记录
		await this.service.log.main.add({ type: 'message_batchUpdate', result, })

    this.ctx.body = this.app.xinError.success(result)
  }

  async detail () {
    const bodyData = this.ctx.request.body || {}
		const filter = bodyData || {}

    const result = await this.service.message.main.detail(filter)

    this.ctx.body = this.app.xinError.success(result)
  }

  async delete () {
    const bodyData = this.ctx.request.body || {}
		const filter = bodyData || {}

    const result = await this.service.message.main.delete(filter)
		// 日志记录
		await this.service.log.main.add({ type: 'message_delete', result: result?._id, })

    this.ctx.body = this.app.xinError.success(result)
  }

  async batchDelete () {
    const bodyData = this.ctx.request.body || {}
    const filter = bodyData || {}

    const result = await this.service.message.main.batchDelete(filter)
		// 日志记录
		await this.service.log.main.add({ type: 'message_batchDelete', result, })

    this.ctx.body = this.app.xinError.success(result)
  }

  // 我的消息汇总信息
  async messageInfo () {
    const token_user_id = this.ctx.xinToken?.user_id || undefined

    const [ res1, res2, ] = await Promise.all([
      this.service.message.main.count({
        state: 1,
      }),
      this.service.message.main.count({
        state: 0,
      }),
    ])

    this.ctx.body = this.app.xinError.success({
      readedNumber: res1 || 0,
      unreadNumber: res2 || 0,
    })
  }
}

module.exports = XinController
