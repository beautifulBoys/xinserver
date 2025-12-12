
'use strict';

const BaseController = require('../../core/baseController')

class XinController extends BaseController {

  async list () {
    const bodyData = this.ctx.request.body || {}

    const result = await this.service.business.dictionary.list(bodyData)

    this.ctx.body = this.app.xinError.success(result)
  }

  async add () {
    const bodyData = this.ctx.request.body || {}

    const result = await this.service.business.dictionary.add(bodyData)
		// 日志记录
		await this.service.log.main.add({ type: 'business_dictionary_add', result: result?._id, })

    this.ctx.body = this.app.xinError.success(result)
  }

  async update () {
    const bodyData = this.ctx.request.body || {}
		const filter = bodyData.filter || {}
		const data = bodyData.data || {}

    const result = await this.service.business.dictionary.update({ filter, data, })
		// 日志记录
		await this.service.log.main.add({ type: 'business_dictionary_update', result, })

    this.ctx.body = this.app.xinError.success(result)
  }

  async batchUpdate () {
    const bodyData = this.ctx.request.body || {}
    const filter = bodyData.filter || {}
    const data = bodyData.data || {}

    const result = await this.service.business.dictionary.batchUpdate({ filter, data, })
		// 日志记录
		await this.service.log.main.add({ type: 'business_dictionary_batchUpdate', result, })

    this.ctx.body = this.app.xinError.success(result)
  }

  async detail () {
    const bodyData = this.ctx.request.body || {}
		const filter = bodyData || {}

    const result = await this.service.business.dictionary.detail(filter)

    this.ctx.body = this.app.xinError.success(result)
  }

  async detailList () {
    const bodyData = this.ctx.request.body || {}
		const filter = bodyData.filter || {}

    let dictionary_id = filter.dictionary_id
    if (!dictionary_id) {
      const res = await this.service.business.dictionary.detail({
        value: filter.value,
        _id: filter.dictionary_id,
      })
      dictionary_id = res?._id
    }

    if (!dictionary_id) {
      this.ctx.body = this.app.xinError.basicError({}, '数据字典不存在')
      return
    }

    const result = await this.service.business.dictionary.list({
      ...bodyData,
      filter: { dictionary_id: dictionary_id, },
    })

    this.ctx.body = this.app.xinError.success(result)
  }

  async delete () {
    const bodyData = this.ctx.request.body || {}
		const filter = bodyData || {}

    const result = await this.service.business.dictionary.delete(filter)
		// 日志记录
		await this.service.log.main.add({ type: 'business_dictionary_delete', result: result?._id, })

    this.ctx.body = this.app.xinError.success(result)
  }

  async batchDelete () {
    const bodyData = this.ctx.request.body || {}
    const filter = bodyData || {}

    const result = await this.service.business.dictionary.batchDelete(filter)
		// 日志记录
		await this.service.log.main.add({ type: 'business_dictionary_batchDelete', result, })

    this.ctx.body = this.app.xinError.success(result)
  }
}

module.exports = XinController
