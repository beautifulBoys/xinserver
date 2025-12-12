
'use strict';

const BaseController = require('../../core/baseController')
const nodetools = require('@xinserver/tools/lib/node')
const path = require('path')
const xml2js = require('xml2js')

const createTextMessageXml = ({ openid, wx_gzh_id, content, }) => {
  return `<xml>
            <ToUserName><![CDATA[${openid}]]></ToUserName>
            <FromUserName><![CDATA[${wx_gzh_id}]]></FromUserName>
            <CreateTime>${Date.now()}</CreateTime>
            <MsgType><![CDATA[text]]></MsgType>
            <Content><![CDATA[${content}]]></Content>
          </xml>`
}


class XinController extends BaseController {

  // 登录 - 暂时好像用不到
  async login () {
    const data = this.ctx.request.body

    const result = await this.service.server.wx.login(data.code)

    if (result.errcode === 0) {
      this.ctx.body = this.ctx.app.xinError.success(result)
    } else {
      this.ctx.body = this.ctx.app.xinError.basicError(null, result.errmsg)
    }
  }

  // 登录 - 暂时好像用不到
  async getPhoneNumber () {
    const data = this.ctx.request.body

    const result = await this.service.server.wx.getPhoneNumber(data)

    this.ctx.body = this.ctx.app.xinError.success(result)
  }

  // 用于公众号服务器配置验证使用
  async callback_get () {
    // 获取微信服务号配置信息
    const options = await this.service.system.option.detail({ key: this.xinConfig.keys.wx_mp_service_key, })
    const wxConfig = options?.value || {}
    const token = wxConfig.token

    // 主要就是验证消息来源是否是微信，以下是验证。
    const { signature, echostr, timestamp, nonce, } = this.ctx.request.query

    // 将 token、timestamp、nonce三个参数按字典序排序
    const str = [ token, timestamp, nonce, ].sort().join('')
    // 加密字符串, 建议使用 sha1加密
    const sha1 = nodetools.crypto?.createHash('sha1').update(str).digest('hex')
    if (sha1 === signature) {
      console.log('验证成功，请求：', this.ctx.request.query)
      this.ctx.body = echostr
    } else {
      this.ctx.body = 'error'
    }
  }

  // 微信所有回调事件，消息等
  async callback_post () {
    // 获取微信服务号配置信息
    const options = await this.service.system.option.detail({ key: this.xinConfig.keys.wx_mp_service_key, })
    const wxConfig = options?.value || {}
    const token = wxConfig.token

    // 此处先验证消息来源是否是微信，密文模式或兼容模式
    const { timestamp, nonce, msg_signature, encrypt_type } = this.ctx.request.query

    console.log('收到微信推送1：', encrypt_type ? '密文模式' : '明文模式', this.ctx.request.query, this.ctx.request.body)

    let xml
    const { xml: bodyData } = await xml2js.parseStringPromise(this.ctx.request.body)

    if (encrypt_type) {
      // 密文模式
      // 微信加密模式必须有encrypt_type=aes和msg_signature
      if (encrypt_type !== 'aes' || !msg_signature) {
        console.error('加密模式必须有encrypt_type=aes和msg_signature', msg_signature)
        this.ctx.body = ``
        this.ctx.status = 400
        return
      }
      // 获取POST的加密消息体
      if (!bodyData || !bodyData.Encrypt) {
        console.error('获取POST的加密消息体', bodyData)
        this.ctx.body = ``
        this.ctx.status = 400
        return
      }

      // 1. 校验签名
      const str = [token, timestamp, nonce, bodyData.Encrypt].sort().join('')
      const sha1 = nodetools.crypto?.createHash('sha1').update(str).digest('hex')
      if (sha1 !== msg_signature) {
        console.error('校验签名失败', sha1, msg_signature)
        this.ctx.body = ``
        this.ctx.status = 400
        return
      }

      // 2. 解密消息
      let decryptedMsg
      try {
        const encrypt = bodyData.Encrypt
        // Base64解码
        const encrypted = Buffer.from(encrypt, 'base64')
        const aesKey = Buffer.from(wxConfig.EncodingAESKey + '=', 'base64')
        const iv = aesKey.slice(0, 16)

        // AES-256-CBC解密
        const decipher = nodetools.crypto?.createDecipheriv('aes-256-cbc', aesKey, iv)
        decipher.setAutoPadding(false)
        let decoded = Buffer.concat([decipher.update(encrypted), decipher.final()])

        // 去除PKCS7填充
        const pad = decoded[decoded.length - 1]
        if (pad < 1 || pad > 32) {
          return decoded
        }
        decoded = decoded.slice(0, decoded.length - pad)

        // 去除前16字节随机数
        const content = decoded.slice(16)

        // 读取4字节网络字节序的msg长度
        const msgLength = content.readUInt32BE(0)

        // 读取msg和appid
        const msg = content.slice(4, 4 + msgLength).toString('utf-8')
        const fromAppId = content.slice(4 + msgLength).toString('utf-8')

        if (fromAppId !== wxConfig.appid) {
          throw new Error('AppID 不匹配')
        }
        xml = msg
      } catch (err) {
        console.error('解密消息失败1', err)
        this.ctx.body = ``
        this.ctx.status = 500
        return
      }
      if (!xml) {
        console.error('解密消息失败2')
        this.ctx.body = ``
        this.ctx.status = 500
        return
      }
    } else {
      // 明文模式
      xml = bodyData
    }

    console.log('微信消息内容：', xml)

    if (xml?.MsgType?.[0] === 'event') { // 事件
      if (xml.Event?.[0] === 'subscribe') { // 关注
        const wx_key = xml.EventKey?.[0]?.replace('qrscene_', '')
        const openid = xml.FromUserName?.[0]
        const wx_gzh_id = xml.ToUserName?.[0]
        console.log(`【微信回调】${openid} 关注成功`)
        wx_key && await this.service.server.wx.update_wx(wx_key, { wx_openid: openid, })
        // 还需要返回一条关注欢迎语
        this.ctx.body = createTextMessageXml({ openid, wx_gzh_id, content: '欢迎关注XinServer服务号！\n您将在该公众号收到平台通知及审批消息' })
      } else if (xml.Event?.[0] === 'unsubscribe') { // 取消关注
        const openid = xml.FromUserName?.[0]
        console.log(`【微信回调】${openid} 取消关注`)
        this.ctx.body = ``
      } else if (xml.Event?.[0] === 'SCAN') { // 关注状态扫码直接登录成功
        const wx_key = xml.EventKey?.[0]?.replace('qrscene_', '')
        const wx_gzh_id = xml.ToUserName?.[0]
        const openid = xml.FromUserName?.[0]
        console.log(`【微信回调】${openid} 扫码成功，wx_key：${wx_key}`)
        wx_key && await this.service.server.wx.update_wx(wx_key, { wx_openid: openid, })
        this.ctx.body = createTextMessageXml({ openid, wx_gzh_id, content: '登录成功！\n感谢使用XinServer服务✨' })
      } else {
        this.ctx.body = ``
      }
    } else {
      this.ctx.body = ``
    }
  }

  // 生成微信服务号的二维码
  async qrcode_create () {
    const bodyData = this.ctx.request.body || {}
    const data = bodyData || {}

    // 第一步，生成 wx_key 用于前端轮询
    const { _id: wx_key } = await this.service.server.wx.add_wx({
      type: 'wx_key',
    })
    // 第二步，获取Ticket，会返回url（二维码地址）
    const res = await this.service.server.wx.getTicket({
      wx_key,
    })
    this.ctx.body = this.ctx.app.xinError.success({
      qrcode: res.url,
      scene: wx_key,
    })
  }

  // 轮询是否已扫码
  async qrcode_loop () {
    const bodyData = this.ctx.request.body || {}
    const data = bodyData || {}

    const res = await this.service.server.wx.detail_wx(data.scene)
    
    this.ctx.body = this.ctx.app.xinError.success(res.wx_openid)
  }

  // 模板消息列表
  async template_message_list () {
    const data = this.ctx.request.body

    const res = await this.service.server.wx.template_message_list({
    })
    
    this.ctx.body = this.ctx.app.xinError.success(res)
  }

  // 发送模板消息
  async send_template_message () {
    const data = this.ctx.request.body

    if (!data.touser || !data.template_id) {
      this.ctx.body = this.ctx.app.xinError.basicError(null, '参数不完整，请检查')
      return
    }

    const res = await this.service.server.wx.send_template_message({
      touser: data.touser,
      template_id: data.template_id,
      url: data.url,
      data: data.data || {},
    })
    
    this.ctx.body = this.ctx.app.xinError.success(res)
  }

  // 菜单发布
  async menu_publish () {
    const data = this.ctx.request.body

    await this.service.server.wx.delete_menu({})
    const res = await this.service.server.wx.create_menu({
      "button": [
        {    
          "type":"view",
          "name":"hvkcoder",
          "url":"http://www.cnblogs.com/hvkcode/"
        },
        {    
          "type":"click",
          "name":"今日推荐",
          "key":"today_recommend"
        },
        {    
          "name":"小工具",
          "sub_button":[
            {
              "type": "scancode_waitmsg", 
              "name": "扫一扫",
              "key": "scancode"
            },
            {
              "type": "pic_sysphoto", 
              "name": "系统拍照发图",
              "key": "take_photo"
            },
            {
              "type": "location_select", 
              "name": "发送位置",
              "key": "send_location"
            }
          ]
        }
      ]
    })
    
    this.ctx.body = this.ctx.app.xinError.success(res)
  }

  
}

module.exports = XinController
