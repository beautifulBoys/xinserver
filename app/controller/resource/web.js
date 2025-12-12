
'use strict';

const BaseController = require('../../core/baseController')
const path = require('path')

class XinController extends BaseController {

  async list () {
    const bodyData = this.ctx.request.body || {}
    const filter = bodyData.filter || {}

    const result = await this.service.resource.web.list(bodyData)

    this.ctx.body = this.app.xinError.success(result)
  }

  async upload () {
    const bodyData = this.ctx.request.body || {}

    const file = this.ctx.request.files[0]
    const filename = file.filename
    const saveUrl = path.join(
      this.xinConfig.paths.resourcePath,
      bodyData.path,
      filename
    )

    // 删除旧文件
    this.service.common.file.deleteFile(saveUrl)
    // 保存新文件
    const result = this.service.common.file.saveFile({
      file: file,
      targetUrl: saveUrl,
    })

    this.ctx.body = this.app.xinError.success(result)
  }

  async mkdir () {
    const bodyData = this.ctx.request.body || {}

    const saveUrl = path.join(
      this.xinConfig.paths.resourcePath,
      bodyData.path,
      bodyData.name
    )
    const result = this.service.common.file.mkdir(saveUrl)
		// 日志记录
		await this.service.log.main.add({ type: 'resource_web_mkdir', result, })

    this.ctx.body = this.app.xinError.success(result)
  }

  async rename () {
    const bodyData = this.ctx.request.body || {}

    // const result = await this.service.resource.web.rename(bodyData)
		// 日志记录
		// await this.service.log.main.add({ type: 'resource_web_rename', result, })

    this.ctx.body = this.app.xinError.success()
  }

  async add () {
    const bodyData = this.ctx.request.body || {}

    const result = await this.service.resource.web.add(bodyData)
		// 日志记录
		await this.service.log.main.add({ type: 'resource_web_add', result, })

    this.ctx.body = this.app.xinError.success(result)
  }

  async update () {
    const bodyData = this.ctx.request.body || {}
		const filter = bodyData.filter || {}
		const data = bodyData.data || {}

    const result = await this.service.resource.web.update({ filter, data, })
		// 日志记录
		await this.service.log.main.add({ type: 'resource_web_update', result, })

    this.ctx.body = this.app.xinError.success(result)
  }

  async batchUpdate () {
    const bodyData = this.ctx.request.body || {}
    const filter = bodyData.filter || {}
    const data = bodyData.data || {}

    const result = await this.service.resource.web.batchUpdate({ filter, data, })
		// 日志记录
		await this.service.log.main.add({ type: 'resource_web_batchUpdate', result, })

    this.ctx.body = this.app.xinError.success(result)
  }

  async detail () {
    const bodyData = this.ctx.request.body || {}
		const filter = bodyData || {}

    const result = await this.service.resource.web.detail(filter)

    this.ctx.body = this.app.xinError.success(result)
  }

  async delete () {
    const bodyData = this.ctx.request.body || {}
		const data = bodyData || {}

    const fullpath = path.join(
      this.xinConfig.paths.resourcePath,
      data.path
    )

    const result = this.service.common.file.deleteFile(fullpath)
		// 日志记录
		await this.service.log.main.add({ type: 'resource_web_delete', result, })

    this.ctx.body = this.app.xinError.success(result)
  }

  async batchDelete () {
    const bodyData = this.ctx.request.body || {}
    const filter = bodyData || {}

    // TODO list 也要改造成对象的{filter, data}格式。
    const { data: fileList } = await this.service.resource.web.list({
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
    const result = await this.service.resource.web.batchDelete(filter)
    // 日志记录
    await this.service.log.main.add({ type: 'resource_web_batchDelete', result, })

    this.ctx.body = this.app.xinError.success(result)
  }
}

module.exports = XinController
