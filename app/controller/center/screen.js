
'use strict';

const BaseController = require('../../core/baseController')

class XinController extends BaseController {

  async component_list () {
    const bodyData = this.ctx.request.body || {}

    const result = await this.service.center.screen.component_list(bodyData)

    this.ctx.body = result
  }

  async block_list () {
    const bodyData = this.ctx.request.body || {}

    const result = await this.service.center.screen.block_list(bodyData)

    this.ctx.body = result
  }
}

module.exports = XinController
