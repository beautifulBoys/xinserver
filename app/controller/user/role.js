
'use strict';

const BaseController = require('../../core/baseController')

class XinController extends BaseController {

  async list () {
    const bodyData = this.ctx.request.body || {}

    const result = await this.service.user.role.list(bodyData)

    this.ctx.body = this.app.xinError.success(result)
  }

  async add () {
    const bodyData = this.ctx.request.body || {}

    const result = await this.service.user.role.add(bodyData)
		// 日志记录
		await this.service.log.main.add({ type: 'user_role_add', result: result?._id, })

    this.ctx.body = this.app.xinError.success(result)
  }

  async update () {
    const bodyData = this.ctx.request.body || {}
		const filter = bodyData.filter || {}
		const data = bodyData.data || {}

    const result = await this.service.user.role.update({ filter, data, })
		// 日志记录
		await this.service.log.main.add({ type: 'user_role_update', result, })

    this.ctx.body = this.app.xinError.success(result)
  }

  async batchUpdate () {
    const bodyData = this.ctx.request.body || {}
    const filter = bodyData.filter || {}
    const data = bodyData.data || {}

    const result = await this.service.user.role.batchUpdate({ filter, data, })
		// 日志记录
		await this.service.log.main.add({ type: 'user_role_batchUpdate', result, })

    this.ctx.body = this.app.xinError.success(result)
  }

  async detail () {
    const bodyData = this.ctx.request.body || {}
		const filter = bodyData || {}

    const result = await this.service.user.role.detail(filter)

    this.ctx.body = this.app.xinError.success(result)
  }

  async delete () {
    const bodyData = this.ctx.request.body || {}
		const filter = bodyData || {}

    const result = await this.service.user.role.delete(filter)
		// 日志记录
		await this.service.log.main.add({ type: 'user_role_delete', result: result?._id, })

    this.ctx.body = this.app.xinError.success(result)
  }

  async batchDelete () {
    const bodyData = this.ctx.request.body || {}
    const filter = bodyData || {}

    const result = await this.service.user.role.batchDelete(filter)
		// 日志记录
		await this.service.log.main.add({ type: 'user_role_batchDelete', result, })

    this.ctx.body = this.app.xinError.success(result)
  }
}

module.exports = XinController
