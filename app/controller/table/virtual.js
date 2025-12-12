
'use strict';

const BaseController = require('../../core/baseController')
const path = require('path')

class XinController extends BaseController {

  async list () {
    const bodyData = this.ctx.request.body || {}
		const filter = bodyData.filter || {}

		if (!filter.table_id) {
			this.ctx.body = this.app.xinError.basicError(null, 'table_id参数缺失')
      return
		}
    const result = await this.service.table.virtual.list(bodyData)

    this.ctx.body = this.app.xinError.success(result)
  }

  async add () {
    const bodyData = this.ctx.request.body || {}

    const result = await this.service.table.virtual.add(bodyData)

    await this.app.messenger.broadcast('refreshMongoModel', { table_id: bodyData.table_id, })

		// 日志记录
		await this.service.log.main.add({ type: 'table_virtual_add', result: result?._id, })

    this.ctx.body = this.app.xinError.success(result)
  }

  async update () {
    const bodyData = this.ctx.request.body || {}
		const filter = bodyData.filter || {}
		const data = bodyData.data || {}

    const result = await this.service.table.virtual.update({ filter, data, })

    await this.app.messenger.broadcast('refreshMongoModel', { table_id: filter.table_id, })

		// 日志记录
		await this.service.log.main.add({ type: 'table_virtual_update', result, })

    this.ctx.body = this.app.xinError.success(result)
  }

  async batchUpdate () {
    const bodyData = this.ctx.request.body || {}
    const filter = bodyData.filter || {}
    const data = bodyData.data || {}

    const result = await this.service.table.virtual.batchUpdate({ filter, data, })
		// 日志记录
		await this.service.log.main.add({ type: 'table_virtual_batchUpdate', result: undefined, })

    this.ctx.body = this.app.xinError.success(result)
  }

  async detail () {
    const bodyData = this.ctx.request.body || {}
		const filter = bodyData || {}

    const result = await this.service.table.virtual.detail(filter)

    this.ctx.body = this.app.xinError.success(result)
  }

  async delete () {
    const bodyData = this.ctx.request.body || {}
		const filter = bodyData || {}

    const result = await this.service.table.virtual.delete(filter)

    await this.app.messenger.broadcast('refreshMongoModel', { table_id: filter.table_id, })

		// 日志记录
		await this.service.log.main.add({ type: 'table_virtual_delete', result: result?._id, })

    this.ctx.body = this.app.xinError.success(result)
  }

  async batchDelete () {
    const bodyData = this.ctx.request.body || {}
    const filter = bodyData || {}

    const result = await this.service.table.virtual.batchDelete(filter)
		// 日志记录
		await this.service.log.main.add({ type: 'table_virtual_batchDelete', result: undefined, })

    this.ctx.body = this.app.xinError.success(result)
  }
}

module.exports = XinController
