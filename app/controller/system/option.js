
'use strict';

const BaseController = require('../../core/baseController')
const tableSdk = require('../../sdk/table')

class XinController extends BaseController {

  async list () {
    const bodyData = this.ctx.request.body || {}

    const result = await this.service.system.option.list(bodyData)

    this.ctx.body = this.app.xinError.success(result)
  }

  async add () {
    const bodyData = this.ctx.request.body || {}

    const result = await this.service.system.option.add(bodyData)

		// 日志记录
		await this.service.log.main.add({ type: 'system_option_add', result: result?._id, })

    this.ctx.body = this.app.xinError.success(result)
  }

  // 有则更新，无则新增
  async upsert () {
    const bodyData = this.ctx.request.body || {}

    const result = await this.service.system.option.upsert(bodyData)

		// 日志记录
		await this.service.log.main.add({ type: 'system_option_upsert', result: result?._id, })

    this.ctx.body = this.app.xinError.success(result)
  }

  async update () {
    const bodyData = this.ctx.request.body || {}
		const filter = bodyData.filter || {}
		const data = bodyData.data || {}

    const result = await this.service.system.option.update({ filter, data, })
		// 日志记录
		await this.service.log.main.add({ type: 'system_option_update', result, })

    this.ctx.body = this.app.xinError.success(result)
  }

  async batchUpdate () {
    const bodyData = this.ctx.request.body || {}
    const filter = bodyData.filter || {}
    const data = bodyData.data || {}

    const result = await this.service.system.option.batchUpdate({ filter, data, })

    this.ctx.body = this.app.xinError.success(result)
  }

  async detail () {
    const bodyData = this.ctx.request.body || {}
		const filter = bodyData || {}

    const result = await this.service.system.option.detail(filter)

    this.ctx.body = this.app.xinError.success(result)
  }

  async delete () {
    const bodyData = this.ctx.request.body || {}
    const filter = bodyData || {}

    const result = await this.service.system.option.delete(filter)
		// 日志记录
		await this.service.log.main.add({ type: 'system_option_delete', result: result?._id, })

    this.ctx.body = this.app.xinError.success(result)
  }

  async batchDelete () {
    const bodyData = this.ctx.request.body || {}
    const filter = bodyData || {}

    const result = await this.service.system.option.batchDelete(filter)

    this.ctx.body = this.app.xinError.success(result)
  }

}

module.exports = XinController
