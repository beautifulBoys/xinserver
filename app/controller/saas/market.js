
'use strict';

const BaseController = require('../../core/baseController')

class XinController extends BaseController {

  // 使用 - 可视化
  async screen_shiyong () {
    const bodyData = this.ctx.request.body || {}

    if (!bodyData?._id) {
      this.ctx.body = this.app.xinError.basicError(null, '可视化参数【_id】缺失')
      return
    }
    const res = await this.centerRequest('/api/core/official/screen/detail', {
      _id: bodyData._id,
    })
    const detailInfo = res?.data?.data

    if (!detailInfo) {
      this.ctx.body = this.app.xinError.basicError(null, '该资源未找到，请联系服务商')
      return
    }
    const expire_time = this.app.dayjs.tz().startOf('day').add(365, 'day').valueOf() - 1
    await Promise.all([
      this.service.screen.main.add({
        name: detailInfo.name,
        type: detailInfo.type,
        avatar: detailInfo.avatar,
        body: detailInfo.body,
        comment: '从模板市场-可视化获取',
      }),
      // 生成订单
      this.service.saas.order.add({
        classify: '可视化',
        pay_method: '免费试用',
        expire_time,
        name: detailInfo?.name,
        price: 0,
        order_state: '已支付',
        comment: ``,
      })
    ])

    this.ctx.body = this.app.xinError.success(true)
  }

  // 使用 - 数据表
  async table_shiyong () {
    const bodyData = this.ctx.request.body || {}
    if (!bodyData?._id) {
      this.ctx.body = this.app.xinError.basicError(null, '数据表参数【_id】缺失')
      return
    }
    const res = await this.centerRequest('/api/core/official/table/detail', {
      _id: bodyData._id,
    })
    const detailInfo = res?.data?.data

    if (!detailInfo) {
      this.ctx.body = this.app.xinError.basicError(null, '该资源未找到，请联系服务商')
      return
    }

    const expire_time = this.app.dayjs.tz().startOf('day').add(365, 'day').valueOf() - 1
    await Promise.all([
      this.service.table.main.add({
        name: detailInfo.name,
        type: detailInfo.type,
        fields: detailInfo.fields,
        comment: '从模板市场-数据表获取',
      }),
      // 生成订单
      this.service.saas.order.add({
        classify: '数据表',
        pay_method: '免费试用',
        expire_time,
        name: detailInfo?.name,
        price: 0,
        order_state: '已支付',
        comment: ``,
      })
    ])

    this.ctx.body = this.app.xinError.success(true)
  }

  // 使用 - 代码块
  async block_shiyong () {
    const bodyData = this.ctx.request.body || {}
    if (!bodyData._id) {
      this.ctx.body = this.app.xinError.basicError(null, '代码块参数【_id】缺失')
      return
    }
    const res = await this.centerRequest('/api/core/official/block/detail', {
      _id: bodyData._id,
    })
    const detailInfo = res?.data?.data

    if (!detailInfo) {
      this.ctx.body = this.app.xinError.basicError(null, '该资源未找到，请联系服务商')
      return
    }
    const expire_time = this.app.dayjs.tz().startOf('day').add(365, 'day').valueOf() - 1
    await Promise.all([
      this.service.screen.main.add({
        name: detailInfo.name,
        type: detailInfo.type,
        avatar: detailInfo.avatar,
        body: detailInfo.body,
        comment: '从模板市场-代码块获取',
      }),
      // 生成订单
      this.service.saas.order.add({
        classify: '代码块',
        pay_method: '免费试用',
        expire_time,
        name: detailInfo?.name,
        price: 0,
        order_state: '已支付',
        comment: ``,
      })
    ])

    this.ctx.body = this.app.xinError.success(true)
  }

  // 使用 - 插件
  async plugin_shiyong () {
    const bodyData = this.ctx.request.body || {}
    if (!bodyData._id) {
      this.ctx.body = this.app.xinError.basicError(null, '插件参数【_id】缺失')
      return
    }
    const res = await this.centerRequest('/api/core/official/plugin/detail', {
      _id: bodyData._id,
    })
    const detailInfo = res?.data?.data
// console.log('---detailInfo=---', detailInfo)
// this.ctx.body = this.app.xinError.basicError(null, '哈哈哈哈哈')
// return
    if (!detailInfo) {
      this.ctx.body = this.app.xinError.basicError(null, '该资源未找到，请联系服务商')
      return
    }
    const expire_time = this.app.dayjs.tz().startOf('day').add(365, 'day').valueOf() - 1
    await Promise.all([
      this.service.saas.myplugin.add({
        type: 'plugin',
        module_key: detailInfo?.input_895bcab8caab,
        name: detailInfo?.input_9fe8c88998ba,
        description: detailInfo?.input_85aaaba838a9,
        version: detailInfo?.input_b7f8cb8ae88b,
        from_type: 'market',
        use_type: 'free',
        load_type: detailInfo?.radio_96585ba90a88,
        load_url: detailInfo?.input_ad0ad8b838a8,
        comment: '从模板市场-插件获取',
      }),
      // 生成订单
      this.service.saas.order.add({
        classify: '插件',
        pay_method: '免费试用',
        expire_time,
        name: detailInfo?.input_9fe8c88998ba,
        price: 0,
        order_state: '已支付',
        comment: ``,
      })
    ])

    this.ctx.body = this.app.xinError.success(true)
  }

}

module.exports = XinController
