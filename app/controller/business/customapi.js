
'use strict';

const BaseController = require('../../core/baseController')

class XinController extends BaseController {

  async list () {
    const bodyData = this.ctx.request.body || {}

    const result = await this.service.business.customapi.list(bodyData)

    this.ctx.body = this.app.xinError.success(result)
  }

  async add () {
    const bodyData = this.ctx.request.body || {}

    const result = await this.service.business.customapi.add(bodyData)

    this.ctx.body = this.app.xinError.success(result)
  }

  async update () {
    const bodyData = this.ctx.request.body || {}
		const filter = bodyData.filter || {}
		const data = bodyData.data || {}

    const result = await this.service.business.customapi.update({ filter, data, })

    this.ctx.body = this.app.xinError.success(result)
  }

  async batchUpdate () {
    const bodyData = this.ctx.request.body || {}
    const filter = bodyData.filter || {}
    const data = bodyData.data || {}

    const result = await this.service.business.customapi.batchUpdate({ filter, data })

    this.ctx.body = this.app.xinError.success(result)
  }

  async detail () {
    const bodyData = this.ctx.request.body || {}
		const filter = bodyData || {}

    const result = await this.service.business.customapi.detail(filter)

    this.ctx.body = this.app.xinError.success(result)
  }

  async delete () {
    const bodyData = this.ctx.request.body || {}
		const filter = bodyData || {}

    const result = await this.service.business.customapi.delete(filter)

    this.ctx.body = this.app.xinError.success(result)
  }

  async batchDelete () {
    const bodyData = this.ctx.request.body || {}
    const filter = bodyData || {}

    const result = await this.service.business.customapi.batchDelete(filter)

    this.ctx.body = this.app.xinError.success(result)
  }

  async run () {
    const bodyData = this.ctx.request.body || {}

    const result = await this.service.business.customapi.run()
    
    this.ctx.body = this.app.xinError.success(result)
  }

  // 自定义请求执行
  async customapi () {
    const bodyData = this.ctx.request.body || {}
    const query = this.ctx.query

    console.log('收到请求', this.ctx.request.url, bodyData, query)
    const lasturl = this.ctx.request.url.split('customapi/')[1]
    const arr = lasturl.split('?')[0]?.split('/')
    const project_unique_id = arr.shift()
    const url = arr.join('/')
    // console.log('----allurl----', lasturl, unique_id, url)
    const { data: list } = await this.service.business.customapi.list({
      filter: {
        url,
        project_unique_id,
        method: this.ctx.request.method?.toUpperCase(),
        state: 0,
        status: true,
      },
      current: 1,
      pageSize: 1,
    })
    const requestData = { query, body: bodyData, request: this.ctx.request, }

    // 此处当做按照：只有一个同名的请求
    const item = list[0]
    if (item) {
      const result = await this.service.business.customapi.run(item, requestData)
      // 记录日志
      await this.service.log.main.add_customapi({
        type: 'customapi_run',
        token: item.projectInfo?.system_account_token,
        request: this.ctx.request,
        requestData: JSON.parse(JSON.stringify(requestData)),
        result: JSON.parse(JSON.stringify(result)),
      })
      this.ctx.body = result
    } else {
      this.ctx.body = this.app.xinError.basicError(null, '未找到请求')
    }
  }
  

  // 自定义请求测试
  async customapiTest () {
    const bodyData = this.ctx.request.body || {}
    const query = this.ctx.query || {}

    const projectInfo = await this.app.models.xin_project.Model.findById(body.project_id).select({ _id: 1, name: 1, system_account_token: 1, }).exec()
    const requestData = { query, body: bodyData, request: this.ctx.request, }
    const result = await this.service.business.customapi.run({
      ...bodyData,
      projectInfo,
    }, requestData)

    this.ctx.body = this.app.xinError.success(result)
  }
  


}

module.exports = XinController
