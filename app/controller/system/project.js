
'use strict';

const BaseController = require('../../core/baseController')
const nodetools = require('@xinserver/tools/lib/node')
const mongoose = require('mongoose')


// const configs = {
//   "aes_key": "IIOAcaqPx9u9fX6uwwKLS08Zw3Z4e+AyGhNSX1JcMeQ=",
//   "aes_iv": "bT+J3LynDAtir0Dzc+RMEw==",
//   "project_id": "690c72ca4223b3975ef5c775",
// }

// const str = JSON.stringify({name: 'lixin', age: 23666})

// const res1 = nodetools.aes_encrypt(str, { key: configs.aes_key, iv: configs.aes_iv })
// console.log('-----res1--', res1)
// const res2 = nodetools.aes_decrypt(res1, { key: configs.aes_key, iv: configs.aes_iv })
// console.log('-----res2--', JSON.parse(res2))

class XinController extends BaseController {

  async list () {
    const bodyData = this.ctx.request.body || {}

    const result = await this.service.system.project.list(bodyData)

    this.ctx.body = this.app.xinError.success(result)
  }

  // 初始化项目
  async add () {
    const bodyData = this.ctx.request.body || {}

    if (bodyData.short_path) {
      const count = await this.service.system.project.count({
        short_path: bodyData.short_path,
      })

      if (count) {
        this.ctx.body = this.app.xinError.basicError(null, '短路径已存在')
        return
      }
    }
    const result = await this.service.system.project.initProject(bodyData)

    this.ctx.body = this.app.xinError.success(result)
  }

  async update () {
    const bodyData = this.ctx.request.body || {}
		const filter = bodyData.filter || {}
		const data = bodyData.data || {}

    const result = await this.service.system.project.update({ filter, data, })

    this.ctx.body = this.app.xinError.success(result)
  }

  async batchUpdate () {
    const bodyData = this.ctx.request.body || {}
    const filter = bodyData.filter || {}
    const data = bodyData.data || {}

    const result = await this.service.system.project.batchUpdate({ filter, data, })

    this.ctx.body = this.app.xinError.success(result)
  }

  // 项目详情
  async detail () {
    const bodyData = this.ctx.request.body || {}
		const filter = bodyData || {}

    const short_path = filter.short_path

    // 此处适应短英文路径访问的情况
    const projectInfo = short_path
                          ? await this.service.system.project.detail_shortPath({ short_path, })
                          : await this.service.system.project.detail({ _id: filter._id, })
    const project_id = String(projectInfo?._id)
    const system_type = this.xinConfig.system_type || 'single'

    // 服务器机器码
    const machineId = nodetools.getMachineId()
    // console.log(this.app.controller, this.app.service)
  //  const license_string1 = await this.service.saas.mylicense.encrypt_licenseString({
  //     type: 'noauth',
  //     // 233服务器
  //     project_id: '691ae88eab835d6af7ac3827',
  //     machineId: 'b1e1c7af-a1d3-444b-8de0-9e6d77a31ad1',
  //     // 本地电脑
  //     // project_id: '690c03f402b44fa128f09be3',
  //     // machineId: 'ac78a17dc1655fbd271b0aabc192cf4cf77672f5622eda768dfb159233badf53',

  //     expire_time: this.app.dayjs.tz().add(7000, 'day').valueOf(),
  //   })
  //   console.log('license_string1', license_string1)

    try {
      if (projectInfo) {
        // 提取授权信息
        const licenseRes = await this.service.system.project.readLicense(project_id)
        const license_string = licenseRes?.license_string
        projectInfo.license_status = this.app.xin._licenseStatus(licenseRes)

        // 查询配置
        const [ uploadRes, ] = await Promise.all([
          this.service.system.option.detail({ key: this.xinConfig.keys.qiniu_cdn_key, }),
        ])

        // 此处追加其他信息
        projectInfo.license_string = license_string
        projectInfo.machineId = machineId
        projectInfo.system_type = system_type
        projectInfo.system_time = this.app.dayjs.tz().format('YYYY-MM-DD HH:mm:ss')
        projectInfo.configs = {
          upload: uploadRes?.value?.state ? { name: uploadRes?.value?.name || 'local_cdn', domain: uploadRes?.value?.domain, } : { name: 'local_cdn', domain: '', },
          other: undefined,
        }

        this.ctx.body = this.app.xinError.success(projectInfo)
      } else {
        this.ctx.body = this.app.xinError.success({
          system_type,
          project_id,
          machineId,
          license_status: 'project_notfound',
        }, '空间不存在，请确认是否正确')
      }
    } catch (err) {
      console.error(err, err.message)
      this.ctx.body = this.app.xinError.success({ system_type, project_id, machineId, }, '授权出错，请检查')
    }
  }

  async delete () {
    const bodyData = this.ctx.request.body || {}
		const filter = bodyData || {}

    const result = await this.service.system.project.delete(filter)

    this.ctx.body = this.app.xinError.success(result)
  }

  async batchDelete () {
    const bodyData = this.ctx.request.body || {}
    const filter = bodyData || {}

    const result = await this.service.system.project.batchDelete(filter)

    this.ctx.body = this.app.xinError.success(result)
  }

  async refreshSystemToken () {
    const bodyData = this.ctx.request.body || {}

    const result = await this.service.system.project.refreshSystemToken(bodyData)

    this.ctx.body = this.app.xinError.success(result)
  }

  

}

module.exports = XinController
