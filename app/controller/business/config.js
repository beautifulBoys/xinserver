
'use strict';

const BaseController = require('../../core/baseController')
const tableSdk = require('../../sdk/table')

class XinController extends BaseController {

  async list () {
    const bodyData = this.ctx.request.body || {}

    const result = await this.service.business.config.list(bodyData)

    this.ctx.body = this.app.xinError.success(result)
  }

  async add () {
    const bodyData = this.ctx.request.body || {}

    const result = await this.service.business.config.add(bodyData)

		// 日志记录
		await this.service.log.main.add({ type: 'business_config_add', result: result?._id, })

    this.ctx.body = this.app.xinError.success(result)
  }

  async upsert () {
    const bodyData = this.ctx.request.body || {}

    const result = await this.service.business.config.upsert(bodyData)

		// 日志记录
		await this.service.log.main.add({ type: 'business_config_upsert', result: result?._id, })

    this.ctx.body = this.app.xinError.success(result)
  }

  async update () {
    const bodyData = this.ctx.request.body || {}
		const filter = bodyData.filter || {}
		const data = bodyData.data || {}

    const result = await this.service.business.config.update({ filter, data, })
		// 日志记录
		await this.service.log.main.add({ type: 'business_config_update', result, })

    this.ctx.body = this.app.xinError.success(result)
  }

  async batchUpdate () {
    const bodyData = this.ctx.request.body || {}
    const filter = bodyData.filter || {}
    const data = bodyData.data || {}

    const result = await this.service.business.config.batchUpdate({ filter, data, })

    this.ctx.body = this.app.xinError.success(result)
  }

  async detail () {
    const bodyData = this.ctx.request.body || {}
		const filter = bodyData || {}

    const result = await this.service.business.config.detail(filter)

    this.ctx.body = this.app.xinError.success(result)
  }

  async delete () {
    const bodyData = this.ctx.request.body || {}
    const filter = bodyData || {}

    const result = await this.service.business.config.delete(filter)
		// 日志记录
		await this.service.log.main.add({ type: 'business_config_delete', result: result?._id, })

    this.ctx.body = this.app.xinError.success(result)
  }

  async batchDelete () {
    const bodyData = this.ctx.request.body || {}
    const filter = bodyData || {}

    const result = await this.service.business.config.batchDelete(filter)

    this.ctx.body = this.app.xinError.success(result)
  }

}

module.exports = XinController
