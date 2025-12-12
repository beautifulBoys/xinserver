
'use strict';

const BaseController = require('../../core/baseController')
const path = require('path')
const fs = require('fs')

class XinController extends BaseController {

  async list () {
    const bodyData = this.ctx.request.body || {}

    const result = await this.service.devops.pjbackup.list(bodyData)

    this.ctx.body = this.app.xinError.success(result)
  }

  async backup () {
    const bodyData = this.ctx.request.body || {}

    const TIME_NOW = this.app.dayjs.tz().format('YYYYMMDDHHmmss')
    const filename = `project_${TIME_NOW}_backup.tar.gz`

    const result = await this.service.devops.pjbackup.add({
      ...(bodyData || {}),
      name: filename,
    })
    // 备份
    this.service.devops.pjbackup.project_backup({ filename, record_id: result._id, })
    // 日志记录
    await this.service.log.main.add({ type: 'devops_pjbackup_backup', result: result?._id, })

    this.ctx.body = this.app.xinError.success(result)
  }

  async add () {
    const bodyData = this.ctx.request.body || {}

    const result = await this.service.devops.pjbackup.add(bodyData)
    // 日志记录
    await this.service.log.main.add({ type: 'devops_pjbackup_add', result: result?._id, })

    this.ctx.body = this.app.xinError.success(result)
  }

  async update () {
    const bodyData = this.ctx.request.body || {}
		const filter = bodyData.filter || {}
		const data = bodyData.data || {}

    const result = await this.service.devops.pjbackup.update({ filter, data, })
		// 日志记录
		await this.service.log.main.add({ type: 'devops_pjbackup_update', result, })

    this.ctx.body = this.app.xinError.success(result)
  }

  async batchUpdate () {
    const bodyData = this.ctx.request.body || {}
    const filter = bodyData.filter || {}
    const data = bodyData.data || {}

    const result = await this.service.devops.pjbackup.batchUpdate({ filter, data, })
		// 日志记录
		await this.service.log.main.add({ type: 'devops_pjbackup_batchUpdate', result, })

    this.ctx.body = this.app.xinError.success(result)
  }

  async detail () {
    const bodyData = this.ctx.request.body || {}
		const filter = bodyData || {}

    const result = await this.service.devops.pjbackup.detail(filter)

    this.ctx.body = this.app.xinError.success(result)
  }

  async delete () {
    const bodyData = this.ctx.request.body || {}
		const filter = bodyData || {}

    const result = await this.service.devops.pjbackup.delete(filter)
		// 日志记录
		await this.service.log.main.add({ type: 'devops_pjbackup_delete', result: result?._id, })

    this.ctx.body = this.app.xinError.success(result)
  }

  async batchDelete () {
    const bodyData = this.ctx.request.body || {}
    const filter = bodyData || {}

    const result = await this.service.devops.pjbackup.batchDelete(filter)
		// 日志记录
		await this.service.log.main.add({ type: 'devops_pjbackup_batchDelete', result, })

    this.ctx.body = this.app.xinError.success(result)
  }

}

module.exports = XinController
