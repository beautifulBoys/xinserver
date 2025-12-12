
'use strict';

const BaseController = require('../../core/baseController')
const path = require('path')

class XinController extends BaseController {

  // AI text
  async text () {
    const bodyData = this.ctx.request.body || {}
		const data = bodyData || {}
    let ai = ''
    let model = ''

    if (!data.content) {
      this.ctx.body = this.ctx.app.xinError.basicError(null, '请输入内容')
      return
    }

    if (!this.app.system_ai.deepseek && !this.app.system_ai.moonshot) {
      this.ctx.body = this.ctx.app.xinError.basicError(null, 'AI尚未配置，请在[系统设置->AI服务配置]中填写')
      return
    }

    let result
    if (this.app.system_ai.deepseek) {
      ai = 'deepseek'
      model = this.app.system_ai.deepseek?.settings?.model
      result = await this.service.server.ai.deepseek(data)
    } else if (this.app.system_ai.moonshot) {
      ai = 'moonshot'
      model = this.app.system_ai.moonshot?.settings?.model
      result = await this.service.server.ai.moonshot(data)
    } else {
      result = {}
    }

    // 添加AI日志记录
    this.service.server.ai.record_add({ ai, model, tokens: result?.tokens || 0, })

    this.ctx.body = result
                      ? this.ctx.app.xinError.success(result)
                      : this.ctx.app.xinError.basicError(null, '生成错误请重试')
  }

  // DeepSeek生成文本
  async deepseek_text () {
    const bodyData = this.ctx.request.body || {}
		const data = bodyData || {}

    if (!data.content) {
      this.ctx.body = this.ctx.app.xinError.basicError(null, '请输入内容')
      return
    }

    if (!this.app.system_ai.deepseek) {
      this.ctx.body = this.ctx.app.xinError.basicError(null, 'DeepSeek服务配置不正确，请联系服务商')
      return
    }

    const result = await this.service.server.ai.deepseek(data)

    // 添加AI日志记录
    const ai = 'deepseek'
    const model = this.app.system_ai.deepseek?.settings?.model
    this.service.server.ai.record_add({ ai, model, tokens: result?.tokens || 0, })

    this.ctx.body = result
                      ? this.ctx.app.xinError.success(result)
                      : this.ctx.app.xinError.basicError(null, '生成错误请重试')
  }

  // Moonshot生成文本
  async moonshot_text () {
    const bodyData = this.ctx.request.body || {}
		const data = bodyData || {}

    if (!data.content) {
      this.ctx.body = this.ctx.app.xinError.basicError(null, '请输入内容')
      return
    }

    if (!this.app.system_ai.moonshot) {
      this.ctx.body = this.ctx.app.xinError.basicError(null, 'Moonshot服务配置不正确，请联系服务商')
      return
    }

    const result = await this.service.server.ai.moonshot(data)

    // 添加AI日志记录
    const ai = 'moonshot'
    const model = this.app.system_ai.moonshot?.settings?.model
    this.service.server.ai.record_add({ ai, model, tokens: result?.tokens || 0, })

    this.ctx.body = result
                      ? this.ctx.app.xinError.success(result)
                      : this.ctx.app.xinError.basicError(null, '生成错误请重试')
  }

}

module.exports = XinController
