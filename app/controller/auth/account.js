'use strict';

const BaseController = require('../../core/baseController')

class XinController extends BaseController {

  // 账号登录
  async login () {
    const bodyData = this.ctx.request.body || {}
    const project_id = this.ctx.xinProject || undefined
    const data = bodyData
    const type = data.type || 'account'
    const usertype = data.usertype || 'outside'
    const defaultUserRoles = this.app.xinConfig.datas?.defaultUserRoles || {}
    let wx_openid, userInfo, mobile, email

    if (type === 'wx_openid') {
      // const wxInfo = await this.service.server.wx.login(data.code)
      // if (wxInfo.errcode !== 0) {
      //   this.ctx.body = wxInfo
      //   return
      // }
      wx_openid = data.wx_openid
    } else if (type === 'smscode') {
      if (!data.mobile) {
        this.ctx.body = this.app.xinError.basicError(null, '请输入手机号')
        return
      }
      if (!data.captcha) {
        this.ctx.body = this.app.xinError.basicError(null, '请输入短信验证码')
        return
      }
      // 默认跳过验证码 666666
      if (data.captcha !== '666666') {
        const smsInfo = await this.service.server.sms.check_smscode({
          type: 'sms_code',
          mobile: data.mobile,
          captcha: data.captcha,
        })
        if (!smsInfo) {
          this.ctx.body = this.app.xinError.basicError(null, '验证码不正确')
          return
        }
      }
      mobile = data.mobile
    } else if (type === 'emailcode') {
      if (!data.email) {
        this.ctx.body = this.app.xinError.basicError(null, '请输入邮箱')
        return
      }
      if (!data.captcha) {
        this.ctx.body = this.app.xinError.basicError(null, '请输入邮箱验证码')
        return
      }
      // 默认跳过验证码 666666
      if (data.captcha !== '666666') {
        const emailInfo = await this.service.server.email.check_emailcode({
          type: 'email_code',
          email: data.email,
          captcha: data.captcha,
        })
        if (!emailInfo) {
          this.ctx.body = this.app.xinError.basicError(null, '验证码不正确')
          return
        }
      }
      email = data.email
    }

    userInfo = await this.service.auth.account.exist({
      usertype,
      ...(type === 'account' ? {
        $or: [
          { username: data.account, },
          { mobile: data.account, },
          { email: data.account, },
        ],
      } : {}),
      ...(type === 'wx_openid' ? {
        wx_openid: wx_openid,
      } : {}),
      ...(type === 'smscode' ? {
        mobile: mobile,
      } : {}),
      ...(type === 'emailcode' ? {
        email: email,
      } : {}),
    })

    userInfo = JSON.parse(JSON.stringify(userInfo || ''))

    if (type === 'account') {
      // 用户不存在
      if (!userInfo || !userInfo.status) {
        const userNotExistError = this.app.xinError.userNotExistError()
        await this.service.log.main.add({ type: 'account_login', status: false, description: userNotExistError.errMsg, result: userNotExistError, })
        this.ctx.body = userNotExistError
        return
      }
      // 密码不正确
      if (userInfo.password !== data.password) {
        const userPasswordError = this.app.xinError.userPasswordError()
        await this.service.log.main.add({ type: 'account_login', status: false, description: userPasswordError.errMsg, result: userPasswordError, })
        this.ctx.body = userPasswordError
        return
      }
      // 账号被禁用等异常情况
      if (userInfo.state !== 0) {
        const userStateError = this.app.xinError.userStateError(userInfo.state)
        await this.service.log.main.add({ type: 'account_login', status: false, description: userStateError.errMsg, result: userStateError, })
        this.ctx.body = userStateError
        return
      }

    } else if (type === 'wx_openid') {
      if (!userInfo) {
        userInfo = await this.service.user.main.add({
          usertype: 'outside',
          name: '微信用户',
          nickname: '微信用户',
          wx_openid: wx_openid,
          roles: defaultUserRoles.wx_openid,
        })
      }
    } else if (type === 'smscode') {
      if (!userInfo) {
        userInfo = await this.service.user.main.add({
          usertype: 'outside',
          name: `手机用户(${mobile})`,
          nickname: `手机用户(${mobile})`,
          mobile: mobile,
          roles: defaultUserRoles.smscode,
        })
      }
    } else if (type === 'emailcode') {
      if (!userInfo) {
        userInfo = await this.service.user.main.add({
          usertype: 'outside',
          name: `邮箱用户(${email})`,
          nickname: `邮箱用户(${email})`,
          email: email,
          roles: defaultUserRoles.emailcode,
        })
      }
    }

    const token = await this.service.auth.account.createToken({
      type: 'login',
      usertype,
      user_id: userInfo._id,
      project_id: project_id,
    }, undefined)

    await this.service.auth.account.setToken({
      _id: userInfo._id,
      token,
    })

    await this.service.log.main.add({ type: 'account_login', status: true, description: '登录成功', token, create_user_id: userInfo?._id, result: null, })

    this.ctx.body = this.app.xinError.success({
      _id: userInfo._id,
      username: userInfo.username,
      nickname: userInfo.nickname,
      name: userInfo.name,
      token,
    })
  }

  // 账号注册 - 暂不启用
  async register () {
    const bodyData = this.ctx.request.body || {}
    const project_id = this.ctx.xinProject || undefined
    const data = bodyData
    const type = data.type || 'account'
    const usertype = data.usertype || 'outside'
    const defaultUserRoles = this.app.xinConfig.datas?.defaultUserRoles || {}
    let wx_openid, userInfo, mobile

    if (type === 'wx_openid') {
      // const wxInfo = await this.service.server.wx.login(data.code)
      // if (wxInfo.errcode !== 0) {
      //   this.ctx.body = wxInfo
      //   return
      // }
      wx_openid = data.wx_openid
    } else if (type === 'smscode') {
      if (!data.captcha) {
        this.ctx.body = this.app.xinError.basicError(null, '请输入短信验证码')
        return
      }
      // 默认跳过验证码 666666
      if (data.captcha !== '666666') {
        const smsInfo = await this.service.server.sms.check_smscode({
          type: 'sms_code',
          mobile: data.mobile,
          captcha: data.captcha,
        })
        if (!smsInfo) {
          this.ctx.body = this.app.xinError.basicError(null, '验证码不正确')
          return
        }
      }
      mobile = data.mobile
    }

    userInfo = await this.service.auth.account.exist({
      usertype,
      ...(type === 'account' ? {
        $or: [
          { username: data.account, },
          { mobile: data.account, },
          { email: data.account, },
        ],
      } : {}),
      ...(type === 'wx_openid' ? {
        wx_openid: wx_openid,
      } : {}),
      ...(type === 'smscode' ? {
        mobile: mobile,
      } : {}),
    })

    userInfo = JSON.parse(JSON.stringify(userInfo || ''))

    if (type === 'account') {
      // 用户已存在
      if (userInfo) {
        const userNotExistError = this.app.xinError.userNotExistError()
        await this.service.log.main.add({ type: 'account_login', status: false, description: userNotExistError.errMsg, result: userNotExistError, })
        this.ctx.body = userNotExistError
        return
      } else {
        userInfo = await this.service.user.main.add({
          usertype: 'outside',
          name: `手机用户(${mobile})`,
          nickname: `手机用户(${mobile})`,
          mobile: mobile,
          roles: defaultUserRoles.smscode,
        })
      }

    } else if (type === 'wx_openid') {
      if (!userInfo) {
        userInfo = await this.service.user.main.add({
          usertype: 'outside',
          name: '微信用户',
          nickname: '微信用户',
          wx_openid: wx_openid,
          roles: defaultUserRoles.wx_openid,
        })
      }
    } else if (type === 'smscode') {
      if (!userInfo) {
        userInfo = await this.service.user.main.add({
          usertype: 'outside',
          name: `手机用户(${mobile})`,
          nickname: `手机用户(${mobile})`,
          mobile: mobile,
          roles: defaultUserRoles.smscode,
        })
      }
    }

    // const token = await this.service.auth.account.createToken({
    //   type: 'login',
    //   usertype,
    //   user_id: userInfo._id,
    //   project_id: project_id,
    // }, undefined)

    // await this.service.auth.account.setToken({
    //   _id: userInfo._id,
    //   token,
    // })

    await this.service.log.main.add({ type: 'account_login', status: true, description: '登录成功', token, create_user_id: userInfo?._id, result: null, })

    this.ctx.body = this.app.xinError.success({
      _id: userInfo._id,
      username: userInfo.username,
      nickname: userInfo.nickname,
      name: userInfo.name,
    })
  }

  // 绑定、换绑手机号
  async bind_mobile () {
    const bodyData = this.ctx.request.body || {}
    const token_user_id = this.ctx.xinToken?.user_id || undefined
    const data = bodyData
    if (!data.captcha) {
      this.ctx.body = this.app.xinError.basicError(null, '请输入短信验证码')
      return
    }
    // 默认跳过验证码 666666
    if (data.captcha !== '666666') {
      const smsInfo = await this.service.server.sms.check_smscode({
        type: 'sms_code',
        mobile: data.mobile,
        captcha: data.captcha,
      })
      if (!smsInfo) {
        this.ctx.body = this.app.xinError.basicError(null, '验证码不正确')
        return
      }
    }
    // 验证码验证通过，查看该手机号是否被该项目下其他账号绑定
    const count = await this.service.user.main.count({
      mobile: data.mobile,
    })
    if (count) {
      this.ctx.body = this.app.xinError.basicError(null, '该手机号已被绑定')
    } else {
      await this.service.user.main.update({ filter: { _id: token_user_id }, data: { mobile: data.mobile, }, })
      this.ctx.body = this.app.xinError.success()
    }
  }

  // 绑定、换绑邮箱
  async bind_email () {
    const bodyData = this.ctx.request.body || {}
    const token_user_id = this.ctx.xinToken?.user_id || undefined
    const data = bodyData
    if (!data.captcha) {
      this.ctx.body = this.app.xinError.basicError(null, '请输入邮箱验证码')
      return
    }
    // 默认跳过验证码 666666
    if (data.captcha !== '666666') {
      const emailInfo = await this.service.server.email.check_emailcode({
        type: 'email_code',
        email: data.email,
        captcha: data.captcha,
      })
      if (!emailInfo) {
        this.ctx.body = this.app.xinError.basicError(null, '验证码不正确')
        return
      }
    }
    // 验证码验证通过，查看该手机号是否被该项目下其他账号绑定
    const count = await this.service.user.main.count({
      email: data.email,
    })
    if (count) {
      this.ctx.body = this.app.xinError.basicError(null, '该邮箱已被绑定')
    } else {
      await this.service.user.main.update({ filter: { _id: token_user_id }, data: { email: data.email, }, })
      this.ctx.body = this.app.xinError.success()
    }
  }

  // 绑定、换绑微信服务号
  async bind_wx () {
    const bodyData = this.ctx.request.body || {}
    const token_user_id = this.ctx.xinToken?.user_id || undefined
    const data = bodyData
    if (!data.wx_openid) {
      this.ctx.body = this.app.xinError.basicError(null, '微信ID缺失')
      return
    }

    // 验证码验证通过，查看该手机号是否被该项目下其他账号绑定
    const count = await this.service.user.main.count({
      wx_openid: data.wx_openid,
    })
    if (count) {
      this.ctx.body = this.app.xinError.basicError(null, '该微信号已被绑定')
    } else {
      await this.service.user.main.update({ filter: { _id: token_user_id }, data: { wx_openid: data.wx_openid, }, })
      this.ctx.body = this.app.xinError.success()
    }
  }

  // 退出
  async logout () {
    const bodyData = this.ctx.request.body || {}
    const data = bodyData || {}

    const token_user_id = this.ctx.xinToken?.user_id || undefined

		const result = await this.service.auth.account.clearToken({ _id: token_user_id, })
		
		// 退出成功，日志记录
		await this.service.log.main.add({ type: 'account_logout', create_user_id: token_user_id, result, })

    this.ctx.body = this.app.xinError.success({ _id: result._id, result: '退出登录' })
  }

}

module.exports = XinController
