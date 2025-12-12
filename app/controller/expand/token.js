
'use strict';

const BaseController = require('../../core/baseController')

class XinController extends BaseController {

  async list () {
    const bodyData = this.ctx.request.body || {}

    const result = await this.service.expand.token.list(bodyData)

    this.ctx.body = this.app.xinError.success(result)
  }

  async add () {
    const bodyData = this.ctx.request.body || {}
    const project_id = this.ctx.xinProject || undefined

    // 获取账号信息
    const accounts = await this.service.system.project.getAccount({ _id: project_id, })

    const token = await this.service.auth.account.createToken({
      type: 'system_front_token',
      usertype: 'outside',
      user_id: accounts.system_front_user_id,
      project_id,
    }, bodyData.auth_days ? `${bodyData.auth_days}d` : undefined)

    const result = await this.service.expand.token.add({
      ...(bodyData || {}),
      token,
    })
		// 日志记录
		await this.service.log.main.add({ type: 'expand_token_add', result: result?._id, })

    this.ctx.body = this.app.xinError.success(result)
  }

  // 失效操作
  async invalidate () {
    const bodyData = this.ctx.request.body || {}

    const token_user_id = this.ctx.xinToken?.user_id || undefined
    const _id = bodyData._id
    delete bodyData._id

    await this.app.models.xin_token_black.Model.insertMany([
      { token: bodyData.token, create_user_id: token_user_id, },
    ])

    const result = await this.service.expand.token.update({
      filter: { _id, },
      data: { state: 'off', },
    })
		// 日志记录
		await this.service.log.main.add({ type: 'expand_token_update', result, })

    this.ctx.body = this.app.xinError.success(result)
  }

  async update () {
    const bodyData = this.ctx.request.body || {}
		const filter = bodyData.filter || {}
		const data = bodyData.data || {}

    const result = await this.service.expand.token.update({ filter, data, })
		// 日志记录
		await this.service.log.main.add({ type: 'expand_token_update', result, })

    this.ctx.body = this.app.xinError.success(result)
  }

  async batchUpdate () {
    const bodyData = this.ctx.request.body || {}
    const filter = bodyData.filter || {}
    const data = bodyData.data || {}

    const result = await this.service.expand.token.batchUpdate({ filter, data, })
		// 日志记录
		await this.service.log.main.add({ type: 'expand_token_batchUpdate', result, })

    this.ctx.body = this.app.xinError.success(result)
  }

  async detail () {
    const bodyData = this.ctx.request.body || {}
		const filter = bodyData || {}

    const result = await this.service.expand.token.detail(filter)

    this.ctx.body = this.app.xinError.success(result)
  }

  async delete () {
    const bodyData = this.ctx.request.body || {}
		const filter = bodyData || {}

    const result = await this.service.expand.token.delete(filter)
		// 日志记录
		await this.service.log.main.add({ type: 'expand_token_delete', result: result?._id, })

    this.ctx.body = this.app.xinError.success(result)
  }

  async batchDelete () {
    const bodyData = this.ctx.request.body || {}
    const filter = bodyData || {}

    const result = await this.service.expand.token.batchDelete(filter)
		// 日志记录
		await this.service.log.main.add({ type: 'expand_token_batchDelete', result, })

    this.ctx.body = this.app.xinError.success(result)
  }
}

module.exports = XinController
