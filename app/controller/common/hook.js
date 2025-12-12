
'use strict';

const BaseController = require('../../core/baseController')

class XinController extends BaseController {

  async get_unique_id () {
    const bodyData = this.ctx.request.body || {}
    const data = bodyData || {}

    const result = await this.service.common.hook.get_unique_id(data.count || 1, data.startStr || '')

    this.ctx.body = this.app.xinError.success(result)
  }

  async get_id () {
    const bodyData = this.ctx.request.body || {}
    const data = bodyData || {}

    const result = await this.service.common.hook.get_mongo_id(data.count || 1)

    this.ctx.body = this.app.xinError.success(result)
  }

}

module.exports = XinController
