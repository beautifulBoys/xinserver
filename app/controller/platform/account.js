'use strict';

const BaseController = require('../../core/baseController')
const nodetools = require('@xinserver/tools/lib/node')

class XinController extends BaseController {

  // 检查手机号是不是已经注册过
  async mobile () {
    const bodyData = this.ctx.request.body || {}


    const userInfo = await this.service.auth.account.exist({
      mobile: bodyData.mobile,
    })
    this.ctx.body = this.app.xinError.success(userInfo)
  }

  // 登录查看用户有哪些企业
  async login () {
    const bodyData = this.ctx.request.body || {}
    const data = bodyData

    const type = data.type || 'account'
    const defaultUserRoles = this.app.xinConfig.datas?.defaultUserRoles || {}

    let mobile

    if (type === 'smscode') {
      if (!data.captcha) {
        this.ctx.body = this.app.xinError.basicError(null, '请输入短信验证码')
        return
      }
      if (data.captcha !== '666666') {
        const smsInfo = await this.service.center.sms.check_smscode({
          mobile: data.mobile,
          code: data.captcha,
        })
        if (smsInfo.errCode !== 0) {
          this.ctx.body = smsInfo
          return
        }
      }
      mobile = data.mobile
    }

    // 查询用户信息
    const userList = await this.service.platform.account.userList({
      ...(type === 'account' ? {
        $or: [
          { username: data.username, },
          { mobile: data.username, },
          { email: data.username, },
        ],
      } : {}),
      ...(type === 'wx_openid' ? {
        wx_openid: data.wx_openid,
      } : {}),
      ...(type === 'smscode' ? {
        mobile: mobile,
      } : {}),
    })

    if (type === 'account') {
      if (userList?.length) {
        const res = userList.filter(a => a.password === data.password)
        if (res?.length) {
          this.ctx.body = this.app.xinError.success({ userList: res, })
          return
        } else {
          this.ctx.body = this.app.xinError.userPasswordError()
          return
        }
      } else {
        // 用户不存在
        this.ctx.body = this.app.xinError.userNotExistError()
        return
      }
    } else if (type === 'wx_openid') {
      if (userList?.length) {
        this.ctx.body = this.app.xinError.success({ userList, })
        return
      } else {
        await this.service.user.main.add({
          name: `微信用户`,
          nickname: '微信用户',
          wx_openid: data.wx_openid,
          roles: defaultUserRoles.wx_openid,
        })
        const userList1 = await this.service.platform.account.userList({
          wx_openid: data.wx_openid,
        })
        this.ctx.body = this.app.xinError.success({ userList: userList1, })
        return
      }
    } else if (type === 'smscode') {
      if (userList?.length) {
        this.ctx.body = this.app.xinError.success({ userList, })
        return
      } else {
        await this.service.user.main.add({
          name: `手机用户(${mobile})`,
          nickname: `手机用户(${mobile})`,
          mobile: mobile,
          roles: defaultUserRoles.smscode,
        })
        const userList1 = await this.service.platform.account.userList({
          mobile: mobile,
        })
        this.ctx.body = this.app.xinError.success({ userList: userList1, })
        return
      }
    } else {
      console.error('出现其他登录方式，请检查', type)
      this.ctx.body = this.app.xinError.loginTypeError()
    }

  }


  // 用户手机号关联了哪些企业
  async user_project_list () {
    const bodyData = this.ctx.request.body || {}

    const mobile = bodyData.mobile
    // const token_user_id = this.ctx.xinToken?.user_id || undefined

    let userList = []
    if (mobile) {
      userList = await this.service.platform.account.userList({
        mobile: mobile,
      })
    } else {

    }
    this.ctx.body = this.app.xinError.success({ userList, })
  }

  // 平台版：用户自己初始化SaaS空间
  async initProject () {
    const bodyData = this.ctx.request.body || {}
    // const project_id = this.xinConfig.project_id || undefined

    const user_id = bodyData.user_id
    delete bodyData.user_id

    // 初始化项目
    const { projectInfo } = await this.service.system.project.initProject({
      ...(bodyData || {}),
    })
    // 将用户绑定上超级管理员权限和项目ID
    const userInfo = await this.service.user.main.update({
      filter: { _id: user_id },
      data: {
        is_super_admin: true,
        project_id: projectInfo?._id,
      },
    })

    this.ctx.body = this.app.xinError.success(projectInfo)
  }

  // 空间版：创建SaaS空间
  async createProject () {
    const bodyData = this.ctx.request.body || {}

    // 初始化项目
    const result = await this.service.system.project.initProject({
      ...(bodyData || {}),
    })

    this.ctx.body = this.app.xinError.success(result)

    // 重启下服务
    this.service.devops.docker.container({
      container: 'xinserver',
      command: 'restart',
      permission: 'system',
    })
  }

  // 加入空间（绑定空间）
  async joinProject () {
    const bodyData = this.ctx.request.body || {}

    const result = await this.app.models.xin_user.Model
                                  .findOneAndUpdate({
                                    _id: bodyData.user_id,
                                  }, {
                                    project_id: bodyData.project_id,
                                    update_time: Date.now(),
                                  }, { new: true })
                                  .exec()
    this.ctx.body = this.app.xinError.success(result)
  }

  // 登陆后生成token
  async create_token () {
    const bodyData = this.ctx.request.body || {}
    const project_id = this.xinConfig.project_id || undefined

    try {
      const userInfo = await this.service.user.main.detail({ _id: bodyData.user_id, })

      const token = await this.service.auth.account.createToken({
        type: 'login',
        usertype: 'outside',
        user_id: userInfo._id,
        project_id,
      }, undefined)

      await this.service.auth.account.setToken({
        _id: userInfo._id,
        token,
      })
      await this.service.log.main.add({ type: 'platform_login', status: true, description: '平台登录成功', project_id: project_id, token, create_user_id: userInfo?._id, result: { user_id: userInfo._id, project_id: project_id, }, })
      this.ctx.body = this.app.xinError.success({
        token,
        project_id,
      })
    } catch (err) {
      console.error(err)
      this.ctx.body = this.app.xinError.basicError(err)
    }
  }

  // 从用户token获取用户信息
  async user () {
    const bodyData = this.ctx.request.body || {}

    if (!bodyData.usertoken) {
      this.ctx.body = this.app.xinError.tokenNotExistError()
      return
    }

    // 解析token，并检查用户token是否过期
    try {
      const decoded = nodetools.jwt_verify(bodyData.usertoken)
      const userInfo = await this.service.user.main.detail({ _id: decoded?.user_id, })
      this.ctx.body = this.app.xinError.success(userInfo)
    } catch (err) {
      console.error(err)
      this.ctx.body = this.app.xinError.success()
    }
  }

}

module.exports = XinController
