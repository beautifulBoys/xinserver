
'use strict';

const BaseController = require('../../core/baseController')
const path = require('path')
const nodetools = require('@xinserver/tools/lib/node')

class XinController extends BaseController {

  async list () {
    const bodyData = this.ctx.request.body || {}
		const filter = bodyData.filter || {}

		if (!filter.tablename && !filter.table_id) {
			this.ctx.body = this.app.xinError.basicError(null, 'tablename 或 table_id 参数缺失')
      return
		}

    const result = await this.service.table.record.list(bodyData)

    this.ctx.body = this.app.xinError.success(result)
  }

  async count () {
    const bodyData = this.ctx.request.body || {}
		const filter = bodyData || {}

		if (!filter.tablename && !filter.table_id) {
			this.ctx.body = this.app.xinError.basicError(null, 'tablename 或 table_id 参数缺失')
      return
		}

    const result = await this.service.table.record.count(filter)

    this.ctx.body = this.app.xinError.success(result)
  }

  async export () {
    const bodyData = this.ctx.request.body || {}
		const filter = bodyData.filter || {}

		if (!filter.tablename && !filter.table_id) {
			this.ctx.body = this.app.xinError.basicError(null, 'tablename 或 table_id 参数缺失')
      return
		}

    const result = await this.service.table.record.export(bodyData)

    this.ctx.body = this.app.xinError.success(result)
  }

  async import () {
    const bodyData = this.ctx.request.body || {}
		const filter = bodyData.filter || {}

		if (!filter.tablename && !filter.table_id) {
			this.ctx.body = this.app.xinError.basicError(null, 'tablename 或 table_id 参数缺失')
      return
		}

    const result = await this.service.table.record.import(bodyData)

    this.ctx.body = this.app.xinError.success(result)
  }

  async add () {
    const bodyData = this.ctx.request.body || {}
    const data = bodyData || {}

		if (!data.tablename && !data.table_id) {
			this.ctx.body = this.app.xinError.basicError(null, 'tablename参数缺失')
      return
		}

    const result = await this.service.table.record.add(data)
		// 日志记录
		await this.service.log.main.add({ type: 'table_record_add', result: result?._id, })

    this.ctx.body = this.app.xinError.success(result)
  }

  async update () {
    const bodyData = this.ctx.request.body || {}
		const filter = bodyData.filter || {}
		const data = bodyData.data || {}

		// if (!filter._id) {
		// 	this.ctx.body = this.app.xinError.basicError(null, '_id参数缺失')
    //   return
		// }

		if (!filter.tablename && !filter.table_id) {
			this.ctx.body = this.app.xinError.basicError(null, 'tablename 或 table_id 参数缺失')
      return
		}

    const result = await this.service.table.record.update({ filter, data, })

		// 日志记录
		await this.service.log.main.add({ type: 'table_record_update', result, })

    this.ctx.body = this.app.xinError.success(result)
  }

  async batchUpdate () {
    const bodyData = this.ctx.request.body || {}
    const filter = bodyData.filter || {}
    const data = bodyData.data || {}

		if (!filter.tablename && !filter.table_id) {
			this.ctx.body = this.app.xinError.basicError(null, 'tablename 或 table_id 参数缺失')
      return
		}

    const result = await this.service.table.record.batchUpdate({ filter, data, })
		// 日志记录
		await this.service.log.main.add({ type: 'table_record_batchUpdate', result: undefined, })

    this.ctx.body = this.app.xinError.success(result)
  }

  async detail () {
    const bodyData = this.ctx.request.body || {}
    const filter = bodyData || {}

		if (!filter.tablename && !filter.table_id) {
			this.ctx.body = this.app.xinError.basicError(null, 'tablename 或 table_id 参数缺失')
      return
		}

		// if (!filter._id) {
		// 	this.ctx.body = this.app.xinError.basicError(null, '_id参数缺失')
    //   return
		// }

    const result = await this.service.table.record.detail(filter)

    this.ctx.body = this.app.xinError.success(result)
  }

  async delete () {
    const bodyData = this.ctx.request.body || {}
		const filter = bodyData || {}

		if (!filter.tablename && !filter.table_id) {
			this.ctx.body = this.app.xinError.basicError(null, 'tablename 或 table_id 参数缺失')
      return
		}

		// if (!filter._id) {
		// 	this.ctx.body = this.app.xinError.basicError(null, '_id参数缺失')
    //   return
		// }

    const result = await this.service.table.record.delete(filter)
		// 日志记录
		await this.service.log.main.add({ type: 'table_record_delete', result: result?._id, })

    this.ctx.body = this.app.xinError.success(result)

  }

  async batchDelete () {
    const bodyData = this.ctx.request.body || {}
    const filter = bodyData || {}

		if (!filter.tablename && !filter.table_id) {
			this.ctx.body = this.app.xinError.basicError(null, 'tablename 或 table_id 参数缺失')
      return
		}

    const result = await this.service.table.record.batchDelete(filter)
		// 日志记录
		await this.service.log.main.add({ type: 'table_record_batchDelete', result: undefined, })

    this.ctx.body = this.app.xinError.success(result)
  }

}

module.exports = XinController
