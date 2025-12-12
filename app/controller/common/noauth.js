
'use strict';
const BaseController = require('../../core/baseController')
const axios = require('axios')

class XinController extends BaseController {

  async main () {
    const bodyData = this.ctx.request.body || {}
    const project_id = this.ctx.xinProject || this.xinConfig.project_id || undefined

    try {
      const { url, data } = bodyData
      const targetUrl = `http://127.0.0.1:80${url}`

      // 获取账号信息
      const accounts = await this.service.system.project.getAccount({ _id: project_id, })

      // 发起转发请求
      const result = await axios({
        method: this.ctx.method, // 保留原请求方法（POST / GET 等）
        url: targetUrl,
        data: data,         // 原 body 除了 url 之外
        headers: {
          'Content-Type': 'application/json',
          'xins-token': String(accounts.system_account_token),
          'xins-project': String(project_id),
        },
        timeout: 60000,     // 可自定义超时
      })

      // 将响应原样返回
      this.ctx.status = result.status
      this.ctx.body = result.data
    } catch (err) {
      console.error(err)
      this.ctx.status = err.response?.status || 500
      this.ctx.body = this.app.xinError.basicError(null, '请求失败')
    }
  }

}

module.exports = XinController
