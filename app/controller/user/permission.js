
'use strict';

const BaseController = require('../../core/baseController')

class XinController extends BaseController {

  async list () {
    const bodyData = this.ctx.request.body || {}

    const result = await this.service.user.permission.list(bodyData)

    this.ctx.body = this.app.xinError.success(result)
  }

  async add () {
    const bodyData = this.ctx.request.body || {}

    const result = await this.service.user.permission.add(bodyData)
		// 日志记录
		await this.service.log.main.add({ type: 'user_permission_add', result: result?._id, })

    this.ctx.body = this.app.xinError.success(result)
  }

  async update () {
    const bodyData = this.ctx.request.body || {}
		const filter = bodyData.filter || {}
		const data = bodyData.data || {}

    const result = await this.service.user.permission.update({ filter, data, })
		// 日志记录
		await this.service.log.main.add({ type: 'user_permission_update', result, })

    this.ctx.body = this.app.xinError.success(result)
  }

  async batchUpdate () {
    const bodyData = this.ctx.request.body || {}
    const filter = bodyData.filter || {}
    const data = bodyData.data || {}

    const result = await this.service.user.permission.batchUpdate({ filter, data })
		// 日志记录
		await this.service.log.main.add({ type: 'user_permission_batchUpdate', result, })

    this.ctx.body = this.app.xinError.success(result)
  }

  async detail () {
    const bodyData = this.ctx.request.body || {}
		const filter = bodyData || {}

    const result = await this.service.user.permission.detail(filter)

    this.ctx.body = this.app.xinError.success(result)
  }

  async delete () {
    const bodyData = this.ctx.request.body || {}
		const filter = bodyData || {}

    const result = await this.service.user.permission.delete(filter)
		// 日志记录
		await this.service.log.main.add({ type: 'user_permission_delete', result: result?._id, })

    this.ctx.body = this.app.xinError.success(result)
  }

  async batchDelete () {
    const bodyData = this.ctx.request.body || {}
    const filter = bodyData || {}

    const result = await this.service.user.permission.batchDelete(filter)
		// 日志记录
		await this.service.log.main.add({ type: 'user_permission_batchDelete', result, })

    this.ctx.body = this.app.xinError.success(result)
  }
}

module.exports = XinController
