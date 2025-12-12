
'use strict';

const BaseController = require('../../core/baseController')
const path = require('path')

class XinController extends BaseController {

  // 发送验证码，只能一个一个发
  async send_emailcode () {
    const bodyData = this.ctx.request.body || {}
		const data = bodyData || {}

    const emailtype = 'email_code'
    const settings = this.app.system_email?.settings || {} // 短信验证码配置
    const emailcode = this.app.system_email?.createCode(6)
    const params = { code: emailcode, minutes: settings.email_code_minutes || 10, }

    if (!this.app.system_email) {
      this.ctx.body = this.ctx.app.xinError.basicError(null, '邮箱服务配置不正确，请联系服务商')
      return
    }
    if (!data.email) {
      this.ctx.body = this.ctx.app.xinError.basicError(null, '请输入邮箱')
      return
    }

    const lastInfo = await this.service.server.email.last({
      type: emailtype,
      email: data.email,
    })
    // 1分钟只能发一次
    if (lastInfo && Date.now() - lastInfo?.create_time < 60000) {
      this.ctx.body = this.ctx.app.xinError.basicError(null, '发送验证码过于频繁，请稍后再试')
      return
    }

    const recordInfo = await this.service.server.email.add({
      type: emailtype,
      params,
      email: data.email,
      ip: this.ctx.request.ip,
    })

    if (!recordInfo) {
      console.error('插入验证码记录错误，recordInfo：', recordInfo)
      this.ctx.body = this.ctx.app.xinError.basicError(null, '验证码发送失败，请联系服务商')
      return
    }

    const result = await this.service.server.email.send({
      to: data.email,
      subject: '验证码',
      html: `验证码：${params.code}，有效期${params.minutes}分钟。如非本人操作，请忽略。`,
    })

    if (result) {
      await this.service.server.email.update(recordInfo._id, {
        result: result.data,
      })
    }

    console.log('--发邮箱记录--', data.email, emailcode, recordInfo._id, result)
    if (result.rejected.length === 0 && result.response?.includes('250')) {
      this.ctx.body = this.ctx.app.xinError.success(result)
    } else {
      this.ctx.body = this.ctx.app.xinError.basicError(null, '服务器开小差了~')
    }
  }

  // 发送邮件
  async send_email () {
    const bodyData = this.ctx.request.body || {}
		const data = bodyData || {}

    const emailtype = 'email'
    const settings = this.app.system_email?.settings || {} // 短信验证码配置
    const emailcode = this.app.system_email?.createCode(6)
    const params = { code: emailcode, minutes: settings.email_code_minutes || 10, }

    if (!this.app.system_email) {
      this.ctx.body = this.ctx.app.xinError.basicError(null, '邮箱服务配置不正确，请联系服务商')
      return
    }
    if (!data.email) {
      this.ctx.body = this.ctx.app.xinError.basicError(null, '请输入收件邮箱')
      return
    }
    if (!data.subject) {
      this.ctx.body = this.ctx.app.xinError.basicError(null, '请输入邮件标题')
      return
    }

    const recordInfo = await this.service.server.email.add({
      type: emailtype,
      params: data.params,
      email: data.email,
      ip: this.ctx.request.ip,
    })

    if (!recordInfo) {
      console.error('插入邮件记录错误，recordInfo：', recordInfo)
      this.ctx.body = this.ctx.app.xinError.basicError(null, '验证码发送失败，请联系服务商')
      return
    }

    const result = await this.service.server.email.send({
      ...(data || {}),
      email: undefined,
      to: data.to || data.email,
    })

    if (result) {
      await this.service.server.email.update(recordInfo._id, {
        result: result?.data,
      })
    }

    console.log('--发邮件记录--', data.email, recordInfo._id, result)
    if (result.rejected.length === 0 && result.response?.includes('250')) {
      this.ctx.body = this.ctx.app.xinError.success(result?.messageId)
    } else {
      this.ctx.body = this.ctx.app.xinError.basicError(null, '服务器开小差了~')
    }
  }

  // 检查验证码是否正确
  async check_emailcode () {
    const bodyData = this.ctx.request.body || {}
		const data = bodyData || {}

    const emailtype = 'email_code'
    const settings = this.app.system_email?.settings || {} // 短信验证码配置

    if (!data.email) {
      this.ctx.body = this.ctx.app.xinError.basicError(null, '请输入邮箱')
      return
    }

    if (!data.captcha) {
      this.ctx.body = this.ctx.app.xinError.basicError(null, '请输入验证码')
      return
    }

    const emailInfo = await this.service.server.email.check_emailcode({
      type: emailtype,
      email: data.email,
      captcha: data.captcha,
    })
    if (emailInfo) {
      this.ctx.body = this.ctx.app.xinError.success()
    } else {
      this.ctx.body = this.app.xinError.basicError(null, '验证码不正确')
    }
  }

}

module.exports = XinController
