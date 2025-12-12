
'use strict';

const BaseController = require('../../core/baseController')

class XinController extends BaseController {

  async list () {
    const bodyData = this.ctx.request.body || {}

    const result = await this.service.saas.myapp.list(bodyData)

    this.ctx.body = this.app.xinError.success(result)
  }

  // 用户有权限的应用
  async userApplist () {
    const bodyData = this.ctx.request.body || {}

    const result = await this.service.saas.myapp.userApplist(bodyData)

    this.ctx.body = this.app.xinError.success(result)
  }

  // 自建或者三方应用
  async freelist () {
    const bodyData = this.ctx.request.body || {}

    const result = await this.service.saas.myapp.freelist(bodyData)

    this.ctx.body = this.app.xinError.success(result)
  }

  // 应用市场安装的应用
  async marketlist () {
    const bodyData = this.ctx.request.body || {}

    const result = await this.service.saas.myapp.marketlist(bodyData)

    this.ctx.body = this.app.xinError.success(result)
  }

  // 应用兑换-用于项目交付，目前是传入源项目ID来获取项目
  async exchange_search () {
    const bodyData = this.ctx.request.body || {}

    if (!bodyData.code) {
      this.ctx.body = this.app.xinError.basicError(null, '参数【code】缺失')
      return
    }
    try {
      const { data: project_list, } = await this.service.system.project.list({
        filter: {
          _id: this.ObjectId(bodyData.code),
          project_status: 'ok',
        },
        select: {
          classify: 0,
          front_routers: 0,
          login: 0,
          dev_scripts: 0,
          admin_menus: 0,
          website: 0,
          plugins: 0,
          otherinfo: 0,
          control: 0,
          system_account_token: 0,
        },
      })
  
      this.ctx.body = this.app.xinError.success(project_list?.length ? project_list : null)
    } catch (err) {
      this.ctx.body = this.app.xinError.basicError(null, '兑换码不正确')
    }
  }

  // 应用兑换-用于项目交付，目前是传入源项目ID来获取项目
  async exchange () {
    const bodyData = this.ctx.request.body || {}

    if (!bodyData.app_project_id) {
      this.ctx.body = this.app.xinError.basicError(null, '参数【app_project_id】缺失')
      return
    }
    // 判断是否已经开通过
    let { data: licenseList, } = await this.service.saas.myapp.project_list({})
    const licenseIdsList = licenseList.map(item => String(item.app_project_id))
    if (licenseIdsList.includes(bodyData.app_project_id)) {
      this.ctx.body = this.app.xinError.basicError(null, '该项目已存在，无需重复兑换')
      return
    }

    const currentProjectInfo = await this.service.system.project.detail({ _id: bodyData.app_project_id, })
    // console.log('--currentProjectInfo--', currentProjectInfo)
    if (!currentProjectInfo) {
      this.ctx.body = this.app.xinError.basicError(null, '兑换项目不存在')
      return
    }

    const expire_time = this.app.dayjs.tz().add(10, 'year').startOf('day').valueOf()

    // console.log('-------exchange------', currentProjectInfo, data, expire_time)
    await Promise.all([
      // 添加使用
      this.service.saas.myapp.addSaasApp({
        platform_type:  currentProjectInfo?.platform_type || 'nocode',
        from_type: 'exchange',
        use_type: 'free',
        app_project_id: bodyData.app_project_id,
        expire_time,
        recordNumber: 100000000,
        userNumber: 1000000,
      }),
      // 生成订单
      this.service.saas.order.add({
        classify: '应用',
        app_project_id: bodyData.app_project_id,
        pay_method: '应用兑换',
        expire_time,
        name: currentProjectInfo?.name,
        price: 0,
        order_state: '已支付',
        comment: `应用兑换`,
      }),
    ])

    this.ctx.body = this.app.xinError.success(true)
  }

  // 试用 - 开通项目
  async shiyong () {
    const bodyData = this.ctx.request.body || {}

    if (!bodyData.app_project_id) {
      this.ctx.body = this.app.xinError.basicError(null, '参数【app_project_id】缺失')
      return
    }

    const appProjectInfo = await this.service.system.project.detail({ _id: bodyData.app_project_id, })
    if (!appProjectInfo) {
      this.ctx.body = this.app.xinError.basicError(null, '安装失败！请联系您的服务商')
      return
    }

    // 判断是否已经开通过
    let { data: licenseList, } = await this.service.saas.myapp.project_list({})
    const licenseIdsList = licenseList.map(item => String(item.app_project_id))
    if (licenseIdsList.includes(bodyData.app_project_id)) {
      this.ctx.body = this.app.xinError.basicError(null, '已开通试用')
      return
    }

    const currentProjectInfo = await this.service.system.project.detail({ _id: bodyData.app_project_id, })

    await Promise.all([
      // 添加使用
      this.service.saas.myapp.addSaasApp({
        platform_type: 'nocode',
        from_type: 'market',
        use_type: 'shiyong',
        app_project_id: bodyData.app_project_id,
        expire_time: this.app.dayjs.tz().add(15, 'day').valueOf(),
        recordNumber: 100,
        userNumber: 5,
      }),
      // 生成订单
      this.service.saas.order.add({
        classify: '应用',
        app_project_id: bodyData.app_project_id,
        pay_method: '免费试用',
        expire_time: this.app.dayjs.tz().add(15, 'day').valueOf(),
        name: currentProjectInfo?.name,
        price: 0,
        order_state: '已支付',
        comment: ``,
      }),
    ])

    this.ctx.body = this.app.xinError.success(true)
  }

  // 开通 - 付款购买授权 - 未完成
  async pay () {
    const bodyData = this.ctx.request.body || {}
    const result = null

    this.ctx.body = this.app.xinError.success(result)
  }

  async add () {
    const bodyData = this.ctx.request.body || {}

    try {
      // 生成无代码应用
      const appInfo = await this.service.nocode.app.add({
        name: bodyData.name,
        logo: bodyData.logo,
      })
      // 生成应用记录
      const result = await this.service.saas.myapp.add({
        ...(bodyData || {}),
        nocode_app_id: appInfo._id,
      })

      this.ctx.body = this.app.xinError.success(result)
    } catch (err) {
      this.ctx.body = this.app.xinError.basicError(null, '操作报错，请重试')
      return
    }
  }

  async update () {
    const bodyData = this.ctx.request.body || {}
		const filter = bodyData.filter || {}
		const data = bodyData.data || {}

    const result = await this.service.saas.myapp.update({ filter, data, })

    this.ctx.body = this.app.xinError.success(result)
  }

  async batchUpdate () {
    const bodyData = this.ctx.request.body || {}
    const filter = bodyData.filter || {}
    const data = bodyData.data || {}

    const result = await this.service.saas.myapp.batchUpdate({ filter, data, })

    this.ctx.body = this.app.xinError.success(result)
  }

  async detail () {
    const bodyData = this.ctx.request.body || {}
		const filter = bodyData || {}

    const result = await this.service.saas.myapp.detail(filter)

    this.ctx.body = this.app.xinError.success(result)
  }

  async delete () {
    const bodyData = this.ctx.request.body || {}
		const filter = bodyData || {}

    const result = await this.service.saas.myapp.delete(filter)

    this.ctx.body = this.app.xinError.success(result)
  }

  async batchDelete () {
    const bodyData = this.ctx.request.body || {}
    const filter = bodyData || {}

    const result = await this.service.saas.myapp.batchDelete(filter)

    this.ctx.body = this.app.xinError.success(result)
  }

}

module.exports = XinController
