
'use strict';

const BaseController = require('../../core/baseController')

class XinController extends BaseController {

  async cdn_token () {
    const bodyData = this.ctx.request.body || {}

    const options = await this.service.system.option.detail({ key: this.xinConfig.keys.qiniu_cdn_key, })

    if (!options) {
      this.ctx.body = this.app.xinError.basicError({}, '未配置七牛云上传')
      return
    }

    const result = await this.service.plugin.qiniu.cdn_token(options?.value)

    this.ctx.body = this.app.xinError.success(result)
  }
}

module.exports = XinController
