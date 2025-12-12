
'use strict';

const BaseController = require('../../core/baseController')
const path = require('path')
const fs = require('fs')

class XinController extends BaseController {

  async list () {
    const bodyData = this.ctx.request.body || {}

    const result = await this.service.devops.dbbackup.list(bodyData)

    this.ctx.body = this.app.xinError.success(result)
  }

  async backup () {
    const bodyData = this.ctx.request.body || {}

    const MONGO_DB_NAME = this.app.xinConfig.MONGO_DB_NAME
    const TIME_NOW = this.app.dayjs.tz().format('YYYYMMDDHHmmss')
    const filename = `${MONGO_DB_NAME}_${TIME_NOW}_backup.tar.gz`

    const savePath = path.join(
      this.xinConfig.paths.resourcePath,
      'backup/mongo',
    )

    const result = await this.service.devops.dbbackup.add({
      ...(bodyData || {}),
      name: filename,
    })
    // 备份
    this.service.devops.dbbackup.mongo_backup({ filename, record_id: result._id, savePath, })
		// 日志记录
		await this.service.log.main.add({ type: 'devops_dbbackup_backup', result: result?._id, })

    this.ctx.body = this.app.xinError.success(result)
  }

  // 上传备份文件
  async upload () {
    const bodyData = this.ctx.request.body || {}

    const file = this.ctx.request.files[0]
    const saveUrl = path.join(
      this.xinConfig.paths.resourcePath,
      'backup/mongo',
      file.filename
    )
    if (fs.existsSync(saveUrl)) {
      this.ctx.body = this.app.xinError.basicError(null, '备份文件已存在')
      return
    }
    const result = await this.service.devops.dbbackup.mongo_upload({
      file,
      targetUrl: saveUrl,
      data: bodyData,
    })

		// // 日志记录
		await this.service.log.main.add({ type: 'devops_dbbackup_upload', result: result?._id, })

    this.ctx.body = this.app.xinError.success(result)
  }

  async restore () {
    const bodyData = this.ctx.request.body || {}

    const detailInfo = await this.service.devops.dbbackup.detail({ _id: bodyData._id, })

		if (!detailInfo) {
			this.ctx.body = this.app.xinError.basicError(null, '当前备份记录不存在')
      return
		}
    if (detailInfo?.url && fs.existsSync(detailInfo.url)) {
      this.ctx.body = this.app.xinError.basicError(null, '备份文件不存在')
      return
    }

    const result = await this.service.devops.dbbackup.add({
      ...(bodyData || {}),
      _id: undefined,
      name: detailInfo.name,
      url: detailInfo.url,
      inset_url: detailInfo.inset_url,
      size: detailInfo.size,
    })
    // 恢复
    const filename = detailInfo?.name
    this.service.devops.dbbackup.mongo_restore({ filename, record_id: result._id, })
		// 日志记录
		await this.service.log.main.add({ type: 'devops_dbbackup_restore', result: result?._id, })

    this.ctx.body = this.app.xinError.success(result)
  }

  async add () {
    const bodyData = this.ctx.request.body || {}

    const result = await this.service.devops.dbbackup.add(bodyData)
		// 日志记录
		await this.service.log.main.add({ type: 'devops_dbbackup_add', result: result?._id, })

    this.ctx.body = this.app.xinError.success(result)
  }

  async update () {
    const bodyData = this.ctx.request.body || {}
		const filter = bodyData.filter || {}
		const data = bodyData.data || {}

    const result = await this.service.devops.dbbackup.update({ filter, data, })
		// 日志记录
		await this.service.log.main.add({ type: 'devops_dbbackup_update', result, })

    this.ctx.body = this.app.xinError.success(result)
  }

  async batchUpdate () {
    const bodyData = this.ctx.request.body || {}
    const filter = bodyData.filter || {}
    const data = bodyData.data || {}

    const result = await this.service.devops.dbbackup.batchUpdate({ filter, data, })
		// 日志记录
		await this.service.log.main.add({ type: 'devops_dbbackup_batchUpdate', result, })

    this.ctx.body = this.app.xinError.success(result)
  }

  async detail () {
    const bodyData = this.ctx.request.body || {}
		const filter = bodyData || {}

    const result = await this.service.devops.dbbackup.detail(filter)

    this.ctx.body = this.app.xinError.success(result)
  }

  async delete () {
    const bodyData = this.ctx.request.body || {}
		const filter = bodyData || {}

    const result = await this.service.devops.dbbackup.delete(filter)

		// 日志记录
		await this.service.log.main.add({ type: 'devops_dbbackup_delete', result: result?._id, })

    this.ctx.body = this.app.xinError.success(result)
  }

  async batchDelete () {
    const bodyData = this.ctx.request.body || {}
    const filter = bodyData || {}

    const result = await this.service.devops.dbbackup.batchDelete(filter)
		// 日志记录
		await this.service.log.main.add({ type: 'devops_dbbackup_batchDelete', result, })

    this.ctx.body = this.app.xinError.success(result)
  }

}

module.exports = XinController
