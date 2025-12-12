
'use strict';

const BaseController = require('../../core/baseController')
const path = require('path')
const mongoose = require('mongoose')

class XinController extends BaseController {

  // 发送验证码，只能一个一个发
  async send_smscode () {
    const bodyData = this.ctx.request.body || {}
		const data = bodyData || {}

    const smstype = 'sms_code'
    const settings = this.app.system_sms?.settings || {} // 短信验证码配置
    const smscode = this.app.system_sms?.createCode(6)
    const params = { code: smscode, minutes: settings.sms_code_minutes || 10, }

    if (!this.app.system_sms) {
      this.ctx.body = this.ctx.app.xinError.basicError(null, '短信服务配置不正确，请联系服务商')
      return
    }
    if (!data.mobile) {
      this.ctx.body = this.ctx.app.xinError.basicError(null, '请输入手机号')
      return
    }
    if (!settings.sms_template_code_id) {
      this.ctx.body = this.ctx.app.xinError.basicError(null, '短信验证码模板未配置')
      return
    }

    const lastInfo = await this.service.server.sms.last({
      type: smstype,
      mobile: data.mobile,
    })
    // 1分钟只能发一次
    if (lastInfo && Date.now() - lastInfo?.create_time < 60000) {
      this.ctx.body = this.ctx.app.xinError.basicError(null, '发送验证码过于频繁，请稍后再试')
      return
    }

    const recordInfo = await this.service.server.sms.add({
      type: smstype,
      mobile: data.mobile,
      template_id: settings.sms_template_code_id,
      params,
      ip: this.ctx.request.ip,
    })

    if (!recordInfo) {
      console.error('插入验证码记录错误，recordInfo：', recordInfo)
      this.ctx.body = this.ctx.app.xinError.basicError(null, '验证码发送失败，请联系服务商')
      return
    }

    const result = await this.service.server.sms.send({
      mobile: data.mobile,
      template_id: settings.sms_template_code_id,
      params,
      smsid: String(recordInfo._id),
    })
    await this.service.server.sms.update(recordInfo._id, {
      result: result.data,
    })
    console.log('--发短信记录--', data.mobile, smscode, recordInfo._id, result.data)
    if (result.data?.code == '0') {
      this.ctx.body = this.ctx.app.xinError.success(result.data)
    } else {
      this.ctx.body = this.ctx.app.xinError.basicError(null, result.data?.msg)
    }
  }

  // 发送短信
  async send_sms () {
    const bodyData = this.ctx.request.body || {}
		const data = bodyData || {}

    const smstype = 'sms'

    if (!this.app.system_sms) {
      this.ctx.body = this.ctx.app.xinError.basicError(null, '短信服务配置不正确，请联系服务商')
      return
    }
    if (!data.mobile) {
      this.ctx.body = this.ctx.app.xinError.basicError(null, '请输入手机号')
      return
    }
    if (!data.template_id) {
      this.ctx.body = this.ctx.app.xinError.basicError(null, '请输入短信模板ID')
      return
    }

    const recordInfo = await this.service.server.sms.add({
      type: smstype,
      mobile: data.mobile,
      template_id: data.template_id,
      params: data.params,
      ip: this.ctx.request.ip,
    })

    if (!recordInfo) {
      console.error('插入短信记录错误，recordInfo：', recordInfo)
      this.ctx.body = this.ctx.app.xinError.basicError(null, '短信发送失败，请联系服务商')
      return
    }

    const result = await this.service.server.sms.send({
      mobile: data.mobile,
      template_id: data.template_id,
      params: data.params,
      smsid: String(recordInfo._id),
    })

    if (result) {
      await this.service.server.sms.update(recordInfo._id, {
        result: result?.data,
      })
    }
    console.log('--发短信记录--', data.mobile, recordInfo._id, result?.data)
    if (result.data?.code == '0') {
      this.ctx.body = this.ctx.app.xinError.success(result.data)
    } else {
      this.ctx.body = this.ctx.app.xinError.basicError(null, result?.data?.msg)
    }
  }

  // 检查验证码是否正确
  async check_smscode () {
    const bodyData = this.ctx.request.body || {}
		const data = bodyData || {}

    const smstype = 'sms_code'
    const settings = this.app.system_sms.settings || {} // 短信验证码配置

    if (!data.mobile) {
      this.ctx.body = this.ctx.app.xinError.basicError(null, '请输入手机号')
      return
    }

    if (!data.captcha) {
      this.ctx.body = this.ctx.app.xinError.basicError(null, '请输入验证码')
      return
    }

    const smsInfo = await this.service.server.sms.check_smscode({
      type: smstype,
      mobile: data.mobile,
      captcha: data.captcha,
    })
    if (smsInfo) {
      this.ctx.body = this.ctx.app.xinError.success()
    } else {
      this.ctx.body = this.app.xinError.basicError(null, '验证码不正确')
    }
  }

}

module.exports = XinController
