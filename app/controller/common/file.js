'use strict';

const BaseController = require('../../core/baseController')
const fs = require('fs')
const path = require('path')
const nodetools = require('@xinserver/tools/lib/node')

class XinController extends BaseController {

  async uploadFile () {
    const bodyData = this.ctx.request.body || {}

    const file = this.ctx.request.files[0]
    const date = this.app.dayjs.tz().format('YYYYMMDD')
    const fileext = file.filename.split('.').pop()
    const savename = this.app.xin.uuid(``, 8) + '.' + fileext

    const targetUrl = path.join(
      this.app.xinConfig.paths.resourcePath,
      'oss',
      date,
      savename
    )

    const result = this.service.common.file.saveFile({
      file: file,
      targetUrl: targetUrl,
    })

    this.ctx.body = this.app.xinError.success(result)
  }

  // 上传授权文件
  async uploadLicense () {
    const project_id = this.ctx.xinProject || this.xinConfig.project_id || undefined
    const bodyData = this.ctx.request.body || {}
    const file = this.ctx.request.files[0]
    const main_project_id = bodyData.main_project_id
    // this.ctx.body = this.app.xinError.basicError(null, '授权文件校验失败')
    // return

    try {
      // 服务器机器码
      const machineId = nodetools.getMachineId()

      let content = this.service.common.file.readFileContent({
        path: file.filepath,
      })
      this.service.common.file.deleteFile(file.filepath)
      // 检查现在是否存在授权
      const licenseRes = await this.service.system.project.readLicense(project_id)

      console.log('----uploadLicense1--', licenseRes)
      const oldlicenseInfo = licenseRes?.licenseInfo
      let newlicenseInfo
      if (main_project_id) {
        const aesKeys = nodetools.aes_pcreate(main_project_id)
        newlicenseInfo = await this.service.saas.mylicense.decrypt_licenseString(content, aesKeys)
        const current_project_license_info = { ...(newlicenseInfo || {}), project_id, }
        content = await this.service.saas.mylicense.encrypt_licenseString(current_project_license_info)
        console.log('---次项目授权---', main_project_id, content, aesKeys, newlicenseInfo, current_project_license_info)
      } else {
        newlicenseInfo = await this.service.saas.mylicense.decrypt_licenseString(content)
      }

      console.log('----uploadLicense2--', main_project_id, project_id, oldlicenseInfo, JSON.stringify(newlicenseInfo))
      // this.ctx.body = this.app.xinError.basicError(null, '授权文12412')
      // return

      if (!newlicenseInfo) {
        this.ctx.body = this.app.xinError.basicError(null, '授权文件校验失败，文件内容无效')
        return
      }

      // 单一机器授权模式，不校验项目
      // if (newlicenseInfo?.project_id !== project_id) {
      //   this.ctx.body = this.app.xinError.basicError(null, '授权文件校验失败，授权不匹配')
      //   return
      // }

      if (newlicenseInfo?.machineId !== machineId) {
        this.ctx.body = this.app.xinError.basicError(null, '授权文件校验失败，授权不匹配')
        return
      }

      if (newlicenseInfo?.expire_time <= Date.now()) {
        this.ctx.body = this.app.xinError.basicError(null, '授权文件校验失败，授权已过期')
        return
      }

      let result
      if (oldlicenseInfo) {
        // 更新授权
        result = await this.service.saas.mylicense.update({ filter: { _id: licenseRes?._id }, data: { license_string: content, }, })
      } else {
        // 新增授权
        result = await this.service.saas.mylicense.add({ license_string: content, project_id, })
      }

      this.ctx.body = this.app.xinError.success(result)
    } catch (err) {
      console.error(err)
      this.ctx.body = this.app.xinError.basicError(null, '授权文件校验失败')
    }
  }

}

module.exports = XinController
