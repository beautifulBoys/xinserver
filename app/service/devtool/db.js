'use strict';

const BaseService = require('../../core/baseService')
const mongoose = require('mongoose')
const conditionSdk = require('../../sdk/condition')
const nodetools = require('@xinserver/tools/lib/node')

class XinService extends BaseService {

  // 完全自由
  async script (data) {
    const project_id = this.ctx.xinProject || undefined
    const token_user_id = this.ctx.xinToken?.user_id || undefined
    const _this = this

    const scriptContexts = conditionSdk.createScriptContexts()
    const scriptObj = this.app.xin.runScriptFunc(data?.script)
    const result = await scriptObj.main({
      ...scriptContexts,
      project_id,
      user_id: token_user_id,
      _this: this,
    }, undefined)

    return result
  }

}

module.exports = XinService
