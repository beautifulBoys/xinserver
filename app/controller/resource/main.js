
'use strict';

const BaseController = require('../../core/baseController')
const path = require('path')

class XinController extends BaseController {

  async list () {
    const bodyData = this.ctx.request.body || {}

    const result = await this.service.resource.main.list(bodyData)

    this.ctx.body = this.app.xinError.success(result)
  }

  async add () {
    const bodyData = this.ctx.request.body || {}

    const result = await this.service.resource.main.add(bodyData)
		// 日志记录
		await this.service.log.main.add({ type: 'resource_add', result, })

    this.ctx.body = this.app.xinError.success(result)
  }

  async checkSize () {
    const bodyData = this.ctx.request.body || {}

    // const diskSize = await this.service.resource.main.allSize({ status: true })

    this.ctx.body = this.app.xinError.success({})
  }

  async update () {
    const bodyData = this.ctx.request.body || {}
		const filter = bodyData.filter || {}
		const data = bodyData.data || {}

    const result = await this.service.resource.main.update({ filter, data, })
		// 日志记录
		await this.service.log.main.add({ type: 'resource_update', result, })

    this.ctx.body = this.app.xinError.success(result)
  }

  async batchUpdate () {
    const bodyData = this.ctx.request.body || {}
    const filter = bodyData.filter || {}
    const data = bodyData.data || {}

    const result = await this.service.resource.main.batchUpdate({ filter, data, })
		// 日志记录
		await this.service.log.main.add({ type: 'resource_batchUpdate', result, })

    this.ctx.body = this.app.xinError.success(result)
  }

  async detail () {
    const bodyData = this.ctx.request.body || {}
		const filter = bodyData || {}

    const result = await this.service.resource.main.detail(filter)

    this.ctx.body = this.app.xinError.success(result)
  }

  async delete () {
    const bodyData = this.ctx.request.body || {}
		const filter = bodyData || {}

    const fileInfo = await this.service.resource.main.detail(filter)
    if (fileInfo?.provider === 'local_cdn') {
      const fullpath = path.join(
        this.app.xinConfig.paths.resourcePath,
        fileInfo.url.split('/').slice(2).join('/')
      )
      this.service.common.file.deleteFile(fullpath)
    }
    const result = await this.service.resource.main.delete(filter)
		// 日志记录
		await this.service.log.main.add({ type: 'resource_delete', result, })

    this.ctx.body = this.app.xinError.success(result)
  }

  async batchDelete () {
    const bodyData = this.ctx.request.body || {}
    const filter = bodyData || {}

    // TODO list 也要改造成对象的{filter, data}格式。
    const { data: fileList } = await this.service.resource.main.list({
      filter: { _ids: filter._ids, },
    })
    const localFileList = fileList.filter(a => a.provider === 'local_cdn')
    for (let i = 0; i < localFileList.length; i++) {
      const fileInfo = localFileList[i]
      const fullpath = path.join(
        this.app.xinConfig.paths.resourcePath,
        fileInfo.url.split('/').slice(2).join('/')
      )
      this.service.common.file.deleteFile(fullpath)
    }
    const result = await this.service.resource.main.batchDelete(filter)
    // 日志记录
    await this.service.log.main.add({ type: 'resource_batchDelete', result, })

    this.ctx.body = this.app.xinError.success(result)
  }
}

module.exports = XinController
