
'use strict';

const BaseController = require('../../core/baseController')

class XinController extends BaseController {

  async list () {
    const bodyData = this.ctx.request.body || {}

    const result = await this.service.saas.order.list(bodyData)

    this.ctx.body = this.app.xinError.success(result)
  }

}

module.exports = XinController
