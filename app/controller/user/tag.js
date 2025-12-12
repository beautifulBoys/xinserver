
'use strict';

const BaseController = require('../../core/baseController')

class XinController extends BaseController {

  async list () {
    const bodyData = this.ctx.request.body || {}

    const result = await this.service.user.tag.list(bodyData)

    this.ctx.body = this.app.xinError.success(result)
  }

  async add () {
    const bodyData = this.ctx.request.body || {}

    const count = await this.service.user.tag.count({
      name: bodyData.name,
    })
		if (count > 0) {
			this.ctx.body = this.app.xinError.basicError(null, '用户标签值已存在')
      return
		}

    const result = await this.service.user.tag.add(bodyData)
		// 日志记录
		await this.service.log.main.add({ type: 'user_tag_add', result: result?._id, })

    this.ctx.body = this.app.xinError.success(result)
  }

  async update () {
    const bodyData = this.ctx.request.body || {}
		const filter = bodyData.filter || {}
		const data = bodyData.data || {}

    const result = await this.service.user.tag.update({ filter, data, })
		// 日志记录
		await this.service.log.main.add({ type: 'user_tag_update', result, })

    this.ctx.body = this.app.xinError.success(result)
  }

  async batchUpdate () {
    const bodyData = this.ctx.request.body || {}
    const filter = bodyData.filter || {}
    const data = bodyData.data || {}

    const result = await this.service.user.tag.batchUpdate({ filter, data, })
		// 日志记录
		await this.service.log.main.add({ type: 'user_tag_batchUpdate', result, })

    this.ctx.body = this.app.xinError.success(result)
  }

  async detail () {
    const bodyData = this.ctx.request.body || {}
		const filter = bodyData || {}

    const result = await this.service.user.tag.detail(filter)

    this.ctx.body = this.app.xinError.success(result)
  }

  async delete () {
    const bodyData = this.ctx.request.body || {}
		const filter = bodyData || {}

    const result = await this.service.user.tag.delete(filter)
		// 日志记录
		await this.service.log.main.add({ type: 'user_tag_delete', result: result?._id, })

    this.ctx.body = this.app.xinError.success(result)
  }

  async batchDelete () {
    const bodyData = this.ctx.request.body || {}
    const filter = bodyData || {}

    const result = await this.service.user.tag.batchDelete(filter)
		// 日志记录
		await this.service.log.main.add({ type: 'user_tag_batchDelete', result, })

    this.ctx.body = this.app.xinError.success(result)
  }
}

module.exports = XinController
