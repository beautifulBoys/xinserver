

const fs = require('fs')
const path = require('path')
const nodemailer = require('nodemailer')
const OpenAI = require('openai')

// 生成n位数字字符串
function createCode (length) {
  length = length || 6
  let code = ''
  for (let i = 0; i < length; i++) {
    code += Math.floor(Math.random() * 10)
  }
  return code
}

class XinServer {
  constructor (app) {
    this.app = app
    this.ctx = app.createAnonymousContext()
    // app.models = this.models = {}
  }

  async init () {
    await Promise.all([
      this.initEmail(),
      this.initSms(),
      this.initAi(),
    ])
    console.log('[xinserver] 初始化成功 ✅')
  }

  async initEmail () {
    const settings = await this.getOption('xin_system_email_settings')
    if (settings) {
      try {
        const transporter = nodemailer.createTransport({
          host: settings.host,
          port: settings.port,
          auth: {
            user: settings.email,
            pass: settings.password,
          },
        })
        this.app.system_email = { transporter, settings, createCode, }
        // console.log('邮箱服务初始化成功')
      } catch (err) {
        console.error('邮箱服务初始化失败')
      }
    }
  }

  async sendEmail (data) {
    if (this.app.system_email) {
      const settings = this.app.system_email.settings || {}
      try {
        const result = await this.app.system_email.transporter?.sendMail({
          from: `${settings.name || settings.email}<${settings.email}>`,
          to: data.to, // 接收邮箱
          cc: data.cc, // 抄送
          bcc: data.bcc, // 密送
          subject: data.subject || '无标题', // 标题
          html: data.html || '无', // HTML内容
        })
        return result
      } catch (err) {
        console.error('邮件发送错误：', err)
        this.ctx.logger.error('邮件发送错误：', err)
        return
      }
    } else {
      return
    }
  }

  async initSms () {
    const settings = await this.getOption('xin_system_sms_settings')

    if (settings) {
      this.app.system_sms = { settings, createCode, }
      // console.log('短信服务初始化成功')
    }
  }

  async sendSms (data) {
    if (this.app.system_sms) {
      const settings = this.app.system_sms.settings || {}
      const provider = settings.provider || 'guoyangyun_sms'
      try {
        const result = await this.ctx.curl('https://api.guoyangyun.com/api/sms/smsoto.htm', {
          dataType: 'json',
          contentType: 'json',
          timeout: 60000,
          data: {
            // 公共参数
            appkey: settings.appkey,
            appsecret: settings.appsecret,
            smsSignId: settings.sms_sign_id, // 签名ID
            // 其它参数
            mobile: data.mobile, // 数组字符串，逗号连接
            templateId: data.template_id || settings.template_id, // 模板ID
            param: data.param, // 模板变量
            smsid: String(data.smsid), // 消息ID，唯一ID
            sendtime: data.sendtime, // 定时发送时间，yyyy-mm-dd hh:mm:ss
          },
        })
        return result
      } catch (err) {
        console.error('邮件发送错误：', err)
        this.ctx.logger.error('邮件发送错误：', err)
        return
      }
    } else {
      return
    }
  }

  async initAi () {
    const [ deepseekSettings, moonshotSettings, openaiSettings ] = await Promise.all([
      this.getOption(this.app.xinConfig.keys.ai_deepseek_key),
      this.getOption(this.app.xinConfig.keys.ai_moonshot_key),
    ])
    // console.log('---deepseekSettings--', deepseekSettings, moonshotSettings)
    this.app.system_ai = {}
    if (deepseekSettings && deepseekSettings.state) {
      try {
        const client = new OpenAI({
          apiKey: deepseekSettings.apiKey,
          baseURL: deepseekSettings.baseURL,
        })
        this.app.system_ai.deepseek = { client, settings: deepseekSettings, }
        // console.log('AI服务初始化成功')
      } catch (err) {
        console.error('AI deepseek 服务初始化失败')
      }
    }
    if (moonshotSettings && moonshotSettings.state) {
      try {
        const client = new OpenAI({
          apiKey: moonshotSettings.apiKey,
          baseURL: moonshotSettings.baseURL,
        })
        this.app.system_ai.deepseek = { client, settings: moonshotSettings, }
        // console.log('AI服务初始化成功')
      } catch (err) {
        console.error('AI moonshot 服务初始化失败')
      }
    }
  }

  async getOption (key) {
    const result = await this.app.models.xin_option.Model
                                  .findOne({
                                    key,
                                  })
                                  .select({
                                    value: 1,
                                  })
                                  .populate([
                                  ])
                                  .lean()
                                  .exec()
    return result?.value
  }

}

module.exports = XinServer
