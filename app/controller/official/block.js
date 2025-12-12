
'use strict';

const BaseController = require('../../core/baseController')

class XinController extends BaseController {

  // 获取列表
  async list () {
    const bodyData = this.ctx.request.body || {}

    if (!this.xinConfig?.official?.saas_block_table_id) {
      this.ctx.body = this.app.xinError.basicError(null, '组件表配置异常')
      return
    }
    const result = await this.service.official.block.list(bodyData)

    this.ctx.body = this.app.xinError.success(result)
  }

  // 更新查看次数和启用次数
  async update () {
    const bodyData = this.ctx.request.body || {}
		const filter = bodyData.filter || {}
		const data = bodyData.data || {}

    const result = await this.service.screen.main.update({ filter, data, })

    this.ctx.body = this.app.xinError.success(result)
  }

  // 获取详情
  async detail () {
    const bodyData = this.ctx.request.body || {}
		const filter = bodyData || {}

    if (!filter._id) {
      this.ctx.body = this.app.xinError.basicError(null, '可视化ID缺失')
      return
    }

    const result = await this.service.screen.main.detail({ _id: filter._id, })

    this.ctx.body = this.app.xinError.success(result)
  }

}

module.exports = XinController
