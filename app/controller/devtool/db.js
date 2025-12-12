
'use strict';

const BaseController = require('../../core/baseController')
const path = require('path')
const mongoose = require('mongoose')

class XinController extends BaseController {

  // 完全自由
  async script () {
    const bodyData = this.ctx.request.body || {}

    const result = await this.service.devtool.db.script(bodyData)

    // 记录执行日志
    await this.service.devtool.dbLog.add({
      script: bodyData.script,
      result,
    })

    this.ctx.body = this.app.xinError.success(result)
  }

}

module.exports = XinController
