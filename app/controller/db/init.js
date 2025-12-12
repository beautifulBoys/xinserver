
'use strict';

const BaseController = require('../../core/baseController')
const path = require('path')

class XinController extends BaseController {

  // 初始化Mongo数据库
  async mongo () {
    const bodyData = this.ctx.request.body || {}

    const result = await this.service.db.index.list(bodyData)

    this.ctx.body = this.app.xinError.success(result)
  }

}

module.exports = XinController
