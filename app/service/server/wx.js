
'use strict';

const BaseService = require('../../core/baseService')

class XinService extends BaseService {

  async login (js_code) {
    const wx_url = 'https://api.weixin.qq.com/sns/jscode2session'

    // 获取微信服务号配置信息
    const options = await this.service.system.option.detail({ key: this.xinConfig.keys.wx_mp_service_key, })
    const wxConfig = options?.value || {}

    let result
    try {
      result = await this.ctx.curl(wx_url, {
        dataType: 'json',
        contentType: 'json',
        timeout: 60000,
        data: {
          appid: wxConfig.appid,
          secret: wxConfig.secret,
          grant_type: 'authorization_code',
          js_code,
        },
      })
    } catch (err) {
      console.error('调取微信接口失败', err)
      this.ctx.logger.error('调取微信接口失败', err)
    }

    return result?.data
  }

  // 用 code 换 access_token
  async access_token (js_code) {
    const wx_url = 'https://api.weixin.qq.com/sns/oauth2/access_token'

    // 获取微信服务号配置信息
    const options = await this.service.system.option.detail({ key: this.xinConfig.keys.wx_mp_service_key, })
    const wxConfig = options?.value || {}

    let result
    try {
      result = await this.ctx.curl(wx_url, {
        dataType: 'json',
        contentType: 'json',
        timeout: 60000,
        method: 'GET',
        data: {
          appid: wxConfig.appid,
          secret: wxConfig.secret,
          grant_type: 'authorization_code',
          js_code,
        },
      })
    } catch (err) {
      console.error('调取微信接口失败', wx_url, err)
      this.ctx.logger.error('调取微信接口失败', err)
    }

    return result?.data
  }

  // 用 access_token 换 userinfo
  async userinfo (js_code) {
    const wx_url = 'https://api.weixin.qq.com/sns/userinfo'

    // 获取微信服务号配置信息
    const options = await this.service.system.option.detail({ key: this.xinConfig.keys.wx_mp_service_key, })
    const wxConfig = options?.value || {}

    let result
    try {
      result = await this.ctx.curl(wx_url, {
        dataType: 'json',
        contentType: 'json',
        timeout: 60000,
        method: 'GET',
        data: {
          appid: wxConfig.appid,
          secret: wxConfig.secret,
          grant_type: 'authorization_code',
          js_code,
        },
      })
    } catch (err) {
      console.error('调取微信接口失败', wx_url, err)
      this.ctx.logger.error('调取微信接口失败', err)
    }

    return result?.data
  }

  // 获取手机号
  async getPhoneNumber (data) {
    const token_user_id = this.ctx.xinToken?.user_id || undefined
    const wx_url = 'https://api.weixin.qq.com/wxa/business/getuserphonenumber'

    let result
    try {
      result = await this.ctx.curl(wx_url, {
        dataType: 'json',
        contentType: 'json',
        timeout: 60000,
        method: 'POST',
        params: {
          access_token: data.access_token,
        },
        data: {
          code: data.code,
        },
      })
    } catch (err) {
      console.error('调取微信接口失败', wx_url, err)
      this.ctx.logger.error('调取微信接口失败', err)
    }
    return result?.data
  }

  // 刷新 AccessToken
  async refreshAccessToken (data) {
    const token_user_id = this.ctx.xinToken?.user_id || undefined
    const wx_url = 'https://api.weixin.qq.com/cgi-bin/token'

    // 获取微信服务号配置信息
    const options = await this.service.system.option.detail({ key: this.xinConfig.keys.wx_mp_service_key, })
    const wxConfig = options?.value || {}

    let result
    try {
      const res = await this.ctx.curl(wx_url, {
        dataType: 'json',
        contentType: 'json',
        timeout: 60000,
        method: 'GET',
        data: {
          appid: wxConfig.appid,
          secret: wxConfig.secret,
          grant_type: 'client_credential',
        },
      })
      // console.log('--refreshAccessToken--', res)
      if (res?.data?.access_token) {
        result = await this.service.server.wx.add_wx({
          type: 'access_token',
          value: res?.data?.access_token,
        })
      } else {
        console.error(res)
      }
    } catch (err) {
      console.error('调取微信接口失败', wx_url, err)
      this.ctx.logger.error('调取微信接口失败', err)
    }

    return result
  }

  // 获取最新的 AccessToken
  async getAccessToken (data) {
    const token_user_id = this.ctx.xinToken?.user_id || undefined

    const result = await this.app.models.xin_wx.Model
                                  .findOne({
                                    type: 'access_token',
                                  })
                                  .sort({
                                    create_time: -1,
                                  })
                                  .exec()

    return result
  }


  // js_sdk相关
  async get_jsapi_ticket (data) {

    const wx_url = 'https://api.weixin.qq.com/cgi-bin/ticket/getticket'

    const { value: access_token } = await this.service.server.wx.getAccessToken()

    let result
    try {
      const res = await this.ctx.curl(wx_url, {
        dataType: 'json',
        contentType: 'json',
        timeout: 60000,
        method: 'GET',
        data: {
          access_token,
          type: 'jsapi',
        },
      })
      if (res?.errcode === 0) {
        // console.log(res.ticket)
        result = res.ticket
      }
    } catch (err) {
      console.error('调取微信接口失败', wx_url, err)
      this.ctx.logger.error('调取微信接口失败', err)
    }
    return result
  }






  // 查询wx记录
  async detail_wx (wx_key) {
    const token_user_id = this.ctx.xinToken?.user_id || undefined

    const result = await this.app.models.xin_wx.Model
                                  .findOne({
                                    _id: wx_key,
                                    type: 'wx_key',
                                  })
                                  .sort({
                                    create_time: -1,
                                  })
                                  .exec()
    return result
  }
  // 新增wx记录
  async add_wx (data) {
    const token_user_id = this.ctx.xinToken?.user_id || undefined

    const result = await new this.app.models.xin_wx.Model({
      ...(data || {}),
      create_user_id: token_user_id,
    }).save()

    return result
  }

  // 更新wx记录
  async update_wx (_id, data) {
    const token_user_id = this.ctx.xinToken?.user_id || undefined

    const result = await this.app.models.xin_wx.Model
                                  .findByIdAndUpdate(_id, {
                                    ...(data || {}),
                                    update_time: Date.now(),
                                  }, { new: true })
                                  .exec()
    return result
  }



  // 服务号相关
  // 获取二维码
  async getTicket (data) {
    const token_user_id = this.ctx.xinToken?.user_id || undefined
    const wx_url = 'https://api.weixin.qq.com/cgi-bin/qrcode/create'
    const scene_str = data.wx_key || this.app.xin.uuid('xinserver_', 18)

    const tokenRes = await this.service.server.wx.getAccessToken()

    if (!tokenRes) {
      return
    }
    const access_token = tokenRes.value

    let result
    try {
      const res = await this.ctx.curl(wx_url + `?access_token=` + access_token, {
        dataType: 'json',
        contentType: 'json',
        timeout: 60000,
        method: 'POST',
        data: JSON.stringify({
          expire_seconds: 600000, // 有效时间 10分钟
          action_name: 'QR_STR_SCENE', // 类型
          action_info: { // 场景值，我用的是随机
            scene: {
              scene_str,
            },
          },
        }),
      })
      if (res?.data) {
        result = res.data
      } else {
        console.error(res)
      }
    } catch (err) {
      console.error('调取微信接口失败', wx_url, err)
      this.ctx.logger.error('调取微信接口失败', err)
    }

    return result
  }

  // ticket换二维码，暂时没有用到，getTicket直接可以获得二维码的解析后url
  async showqrcode (data) {
    const token_user_id = this.ctx.xinToken?.user_id || undefined
    const wx_url = 'https://api.weixin.qq.com/cgi-bin/showqrcode'

    let result
    try {
      const res = await this.ctx.curl(wx_url, {
        dataType: 'json',
        contentType: 'json',
        timeout: 60000,
        method: 'GET',
        params: {
          access_token: encodeURIComponent(data.ticket),
        },
        data: {
        },
      })
      if (res?.data) {
        result = res.data
      } else {
        console.error(res)
      }
    } catch (err) {
      console.error('调取微信接口失败', wx_url, err)
      this.ctx.logger.error('调取微信接口失败', err)
    }

    return result
  }

  // 删除菜单
  async delete_menu (data) {
    const token_user_id = this.ctx.xinToken?.user_id || undefined
    const wx_url = 'https://api.weixin.qq.com/cgi-bin/menu/delete'

    const { value: access_token } = await this.service.server.wx.getAccessToken()

    let result
    try {
      const res = await this.ctx.curl(wx_url + `?access_token=` + access_token, {
        dataType: 'json',
        contentType: 'json',
        timeout: 60000,
        method: 'POST',
        data: {
        },
      })
      console.log('---delete_menu--', res.data)
      if (res?.data) {
        result = res.data
      } else {
        console.error(res)
      }
    } catch (err) {
      console.error('调取微信接口失败', wx_url, err)
      this.ctx.logger.error('调取微信接口失败', err)
    }

    return result
  }

  // 新增菜单
  async create_menu (data) {
    const token_user_id = this.ctx.xinToken?.user_id || undefined
    const wx_url = 'https://api.weixin.qq.com/cgi-bin/menu/create'

    const { value: access_token } = await this.service.server.wx.getAccessToken()

    let result
    try {
      const res = await this.ctx.curl(wx_url + `?access_token=` + access_token, {
        dataType: 'json',
        contentType: 'json',
        timeout: 60000,
        method: 'POST',
        data: JSON.stringify(data),
      })
      console.error('---create_menu--', res.data, data)
      if (res?.data) {
        result = res.data
      } else {
        console.error(res)
      }
    } catch (err) {
      console.error('调取微信接口失败', wx_url, err)
      this.ctx.logger.error('调取微信接口失败', err)
    }

    return result
  }

  // 模板信息列表
  async template_message_list (data) {
    // const token_user_id = this.ctx.xinToken?.user_id || undefined
    const wx_url = 'https://api.weixin.qq.com/cgi-bin/template/get_all_private_template'

    const { value: access_token } = await this.service.server.wx.getAccessToken()

    let result
    try {
      const res = await this.ctx.curl(wx_url + `?access_token=` + access_token, {
        dataType: 'json',
        contentType: 'json',
        timeout: 60000,
        method: 'GET',
        data: {},
      })
      if (res?.data) {
        result = res.data
      } else {
        console.error(res)
      }
    } catch (err) {
      console.error('调取微信接口失败', wx_url, err)
      this.ctx.logger.error('调取微信接口失败', err)
    }

    return result
  }

  // 发送模板信息
  async send_template_message (data) {
    // const token_user_id = this.ctx.xinToken?.user_id || undefined
    const wx_url = 'https://api.weixin.qq.com/cgi-bin/message/template/send'

    const { value: access_token } = await this.service.server.wx.getAccessToken()

    let result
    try {
      const res = await this.ctx.curl(wx_url + `?access_token=` + access_token, {
        dataType: 'json',
        contentType: 'json',
        timeout: 60000,
        method: 'POST',
        data: JSON.stringify({
          touser: data.touser,
          template_id: data.template_id,
          url: data.url,
          data: data.data,
        }),
      })
      // console.log('---send_template_message---', data, res)
      if (res?.data) {
        result = res.data
      } else {
        console.error(res)
      }
    } catch (err) {
      console.error('调取微信接口失败', wx_url, err)
      this.ctx.logger.error('调取微信接口失败', err)
    }

    return result
  }
}

module.exports = XinService



