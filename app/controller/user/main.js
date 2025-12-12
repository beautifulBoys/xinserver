
'use strict';

const BaseController = require('../../core/baseController')

class XinController extends BaseController {

  async list () {
    const bodyData = this.ctx.request.body || {}

    const result = await this.service.user.main.list(bodyData)

    this.ctx.body = this.app.xinError.success(result)
  }

  // 检查是否具有超级管理员账号
  async check_admin () {
    const bodyData = this.ctx.request.body || {}

    const result = await this.service.user.main.count({
      usertype: 'inside',
      is_super_admin: true,
      status: true,
    })

    this.ctx.body = this.app.xinError.success(result)
  }

  // 初始化超级管理员账号
  async add_admin () {
    const bodyData = this.ctx.request.body || {}

    const result = await this.service.user.main.add(bodyData)
		// 日志记录
		await this.service.log.main.add({ type: 'user_add', result: result?._id, })

    this.ctx.body = this.app.xinError.success(result)
  }

  async add () {
    const bodyData = this.ctx.request.body || {}

    const result = await this.service.user.main.add(bodyData)
		// 日志记录
		await this.service.log.main.add({ type: 'user_add', result: result?._id, })

    this.ctx.body = this.app.xinError.success(result)
  }

  async mine () {
    const bodyData = this.ctx.request.body || {}

    const result = await this.service.user.main.mine(bodyData)
    if (!result) {
      this.ctx.body = this.app.xinError.tokenNoPermissionError(result)
      return
    }
		const roleList = await this.service.user.role.getListByRole({
      value: { $in: result.roles || [] },
		})
		const permissions = roleList.map(item => item.permissions).filter(item => item && item.length).toString().split(',').filter(Boolean)
// console.log('---', result, roleList, permissions)
    this.ctx.body = this.app.xinError.success({
      ...result,
			permissions,
      password: undefined,
      // wx_openid: undefined,
      wx_openid: result?.wx_openid ? '已绑定' : undefined,
			token: result.token ? result.token.pop() : undefined,
    })
  }

  async update () {
    const bodyData = this.ctx.request.body || {}
		const filter = bodyData.filter || {}
		const data = bodyData.data || {}

    const result = await this.service.user.main.update({ filter, data, })
		// 日志记录
		await this.service.log.main.add({ type: 'user_update', result, })

    this.ctx.body = this.app.xinError.success(result)
  }


  async transferSuperAdmin () {
    const bodyData = this.ctx.request.body || {}
    const token_user_id = this.ctx.xinToken?.user_id || undefined
    const transfer_user_id = bodyData.transfer_user_id

    const userlist = await this.service.user.main.batchUpdate({
      filter: {},
      data: { is_super_admin: false, },
    })
    const result = await this.service.user.main.update({
      filter: { _id: transfer_user_id },
      data: { is_super_admin: true, },
    })

    this.ctx.body = this.app.xinError.success(result)
  }

  async batchUpdate () {
    const bodyData = this.ctx.request.body || {}
    const filter = bodyData.filter || {}
    const data = bodyData.data || {}

    const result = await this.service.user.main.batchUpdate({ filter, data, })
		// 日志记录
		await this.service.log.main.add({ type: 'user_batchUpdate', result, })

    this.ctx.body = this.app.xinError.success(result)
  }

  async detail () {
    const bodyData = this.ctx.request.body || {}
		const filter = bodyData || {}

    const result = await this.service.user.main.detail(filter)

    this.ctx.body = this.app.xinError.success(result)
  }

  async delete () {
    const bodyData = this.ctx.request.body || {}
		const filter = bodyData || {}

    const result = await this.service.user.main.delete(filter)
		// 日志记录
		await this.service.log.main.add({ type: 'user_delete', result: result?._id, })

    this.ctx.body = this.app.xinError.success(result)
  }

  async batchDelete () {
    const bodyData = this.ctx.request.body || {}
    const filter = bodyData || {}

    const result = await this.service.user.main.batchDelete(filter)
		// 日志记录
		await this.service.log.main.add({ type: 'user_batchDelete', result, })

    this.ctx.body = this.app.xinError.success(result)
  }
}

module.exports = XinController
