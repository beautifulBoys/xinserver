
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
    const result = await this.service.table.index.list(bodyData)

    this.ctx.body = this.app.xinError.success(result)
  }

  async add () {
    const bodyData = this.ctx.request.body || {}

    const result = await this.service.table.index.add(bodyData)
		// 日志记录
		await this.service.log.main.add({ type: 'table_index_add', result: result?._id, })

    this.ctx.body = this.app.xinError.success(result)
  }

  async update () {
    const bodyData = this.ctx.request.body || {}
		const filter = bodyData.filter || {}
		const data = bodyData.data || {}

    const result = await this.service.table.index.update({ filter, data, })
		// 日志记录
		await this.service.log.main.add({ type: 'table_index_update', result, })

    this.ctx.body = this.app.xinError.success(result)
  }

  async detail () {
    const bodyData = this.ctx.request.body || {}
		const filter = bodyData || {}

    const result = await this.service.table.index.detail(filter)

    this.ctx.body = this.app.xinError.success(result)
  }

  async delete () {
    const bodyData = this.ctx.request.body || {}
		const filter = bodyData || {}

    const result = await this.service.table.index.delete(filter)
		// 日志记录
		await this.service.log.main.add({ type: 'table_index_delete', result: result?._id, })

    this.ctx.body = this.app.xinError.success(result)
  }
}

module.exports = XinController
