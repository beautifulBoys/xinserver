
'use strict';

const BaseController = require('../../core/baseController')
const nodetools = require('@xinserver/tools/lib/node')

class XinController extends BaseController {

  async list () {
    const bodyData = this.ctx.request.body || {}

    const result = await this.service.saas.mylicense.list(bodyData)

    this.ctx.body = this.app.xinError.success(result)
  }

  async add () {
    const bodyData = this.ctx.request.body || {}

    const result = await this.service.saas.mylicense.add(bodyData)

    this.ctx.body = this.app.xinError.success(result)
  }

  async update () {
    const bodyData = this.ctx.request.body || {}
		const filter = bodyData.filter || {}
		const data = bodyData.data || {}

    const result = await this.service.saas.mylicense.update({ filter, data, })

    this.ctx.body = this.app.xinError.success(result)
  }

  async batchUpdate () {
    const bodyData = this.ctx.request.body || {}
    const filter = bodyData.filter || {}
    const data = bodyData.data || {}

    const result = await this.service.saas.mylicense.batchUpdate({ filter, data, })

    this.ctx.body = this.app.xinError.success(result)
  }

  async updateLicense () {
    const bodyData = this.ctx.request.body || {}
    const project_id = bodyData.project_id
    delete bodyData.project_id
    const result = await this.service.saas.mylicense.updateLicense(project_id, bodyData)

    this.ctx.body = this.app.xinError.success(result)
  }

  // 授权详情
  async detail () {
    const bodyData = this.ctx.request.body || {}
		const filter = bodyData || {}

    const project_id = filter.project_id
    const result = await this.service.saas.mylicense.lowcode_detail({ project_id, })

    this.ctx.body = this.app.xinError.success(result)
  }

  async delete () {
    const bodyData = this.ctx.request.body || {}
		const filter = bodyData || {}

    const result = await this.service.saas.mylicense.delete(filter)

    this.ctx.body = this.app.xinError.success(result)
  }

  async batchDelete () {
    const bodyData = this.ctx.request.body || {}
    const filter = bodyData || {}

    const result = await this.service.saas.mylicense.batchDelete(filter)

    this.ctx.body = this.app.xinError.success(result)
  }

  // 开通低代码能力
  async use () {
    const bodyData = this.ctx.request.body || {}
    const project_id = this.ctx.xinProject || undefined

    const licenseRes = await this.service.system.project.readLicense(project_id)
    const licenseInfo = licenseRes?.licenseInfo
    let result
    console.log('licenseInfo', licenseInfo)
    if (licenseInfo) {
      if (licenseInfo.expire_time > Date.now()) { // 授权期，正常使用
        result = true
      } else { // 已过期
        const license_string = await this.service.saas.mylicense.encrypt_licenseString({
          ...(licenseInfo || {}),
          type: 'machineid',
          lowcode_isopen: true,
          expire_time: this.app.dayjs.tz().startOf('days').add(3, 'month').valueOf(),
        })
        result = await this.service.saas.mylicense.update({ filter: { _id: licenseRes?._id }, data: { license_string, }, })
      }
    } else {
      const license_string = await this.service.saas.mylicense.encrypt_licenseString({
        project_id,
        type: 'machineid',
        lowcode_isopen: true,
        expire_time: this.app.dayjs.tz().startOf('days').add(3, 'month').valueOf(),
      })
      result = await this.service.saas.mylicense.add({ license_string, })
    }

    this.ctx.body = this.app.xinError.success(result)
  }

}

module.exports = XinController
