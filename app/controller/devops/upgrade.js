
'use strict';

const BaseController = require('../../core/baseController')
const path = require('path')
const fs = require('fs')

class XinController extends BaseController {

  async list () {
    const bodyData = this.ctx.request.body || {}

    const result = await this.service.devops.upgrade.list(bodyData)

    this.ctx.body = this.app.xinError.success(result)
  }

  async upload () {
    const bodyData = this.ctx.request.body || {}

    const file = this.ctx.request.files[0]
    const filename = file.filename
    const saveUrl = path.join(
      this.xinConfig.paths.resourcePath,
      'upgrade',
      filename
    )

    if (fs.existsSync(saveUrl)) {
      this.ctx.body = this.app.xinError.basicError(null, '文件已存在')
      return
    }

    // 保存新文件
    const result = this.service.common.file.saveFile({
      file: file,
      targetUrl: saveUrl,
    })
    // 日志记录
    await this.service.log.main.add({ type: 'devops_upgrade_upload', result, })

    this.ctx.body = this.app.xinError.success(result)
  }

  async install () {
    const bodyData = this.ctx.request.body || {}
    const data = bodyData || {}

    const sourceUrl = path.join(
      this.xinConfig.paths.resourcePath,
      data.path.split('/resource/')[1]
    )

    if (!fs.existsSync(sourceUrl)) {
      this.ctx.body = this.app.xinError.basicError(null, '文件不存在')
      return
    }

    // 删除原目录并解压
    this.service.common.file.deleteFile('/xinlinshi')
    this.service.common.file.mkdir('/xinlinshi')
    this.service.common.file.deleteFile('/xincore/code')
    this.service.common.file.mkdir('/xincore/code')
    this.service.common.file.deleteFile('/xincore/html/index.html')
    this.service.common.file.deleteFile('/xincore/html/lib')
    // 解压
    const result = this.service.common.file.decompression(sourceUrl, '/xinlinshi')
    // 拷贝后端代码
    this.service.common.file.copyFile('/xinlinshi/admin', '/xincore/code')
    // 拷贝前端代码
    this.service.common.file.copyFile('/xinlinshi/front/index.html', '/xincore/html/index.html')
    this.service.common.file.copyFile('/xinlinshi/front/lib', '/xincore/html/lib')

    // 删除临时目录
    this.service.common.file.deleteFile('/xinlinshi')
    // 日志记录
    await this.service.log.main.add({ type: 'devops_upgrade_install', result, })

    this.ctx.body = this.app.xinError.success(result)
  }

  async add () {
    const bodyData = this.ctx.request.body || {}

    const result = await this.service.devops.upgrade.add(bodyData)
    // 日志记录
    await this.service.log.main.add({ type: 'devops_upgrade_add', result, })

    this.ctx.body = this.app.xinError.success(result)
  }

  async update () {
    const bodyData = this.ctx.request.body || {}
    const filter = bodyData.filter || {}
    const data = bodyData.data || {}

    const result = await this.service.devops.upgrade.update({ filter, data, })
    // 日志记录
    await this.service.log.main.add({ type: 'devops_upgrade_update', result, })

    this.ctx.body = this.app.xinError.success(result)
  }

  async detail () {
    const bodyData = this.ctx.request.body || {}
    const filter = bodyData || {}

    const result = await this.service.devops.upgrade.detail(filter)

    this.ctx.body = this.app.xinError.success(result)
  }

  async delete () {
    const bodyData = this.ctx.request.body || {}
    const data = bodyData || {}

    const fullpath = path.join(
      this.xinConfig.paths.resourcePath.replace('/resource', ''),
      data.path
    )
console.log('-------fullpath', data, fullpath)
    const result = this.service.common.file.deleteFile(fullpath)
    // 日志记录
    await this.service.log.main.add({ type: 'devops_upgrade_delete', result, })

    this.ctx.body = this.app.xinError.success(result)
  }

}

module.exports = XinController
