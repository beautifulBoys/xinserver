
'use strict';
// 模板市场服务
const BaseController = require('../../core/baseController')

class XinController extends BaseController {


  // 全部数据表列表
  async table_list () {
    const bodyData = this.ctx.request.body || {}

    const result = await this.service.center.noauth.api(
      '/api/core/table/record/list',
      bodyData,
    )

    this.ctx.body = result
  }

  async table_update () {
    const bodyData = this.ctx.request.body || {}

    const result = await this.service.center.noauth.api(
      '/api/core/table/record/update',
      bodyData,
    )

    this.ctx.body = result
  }

  async table_install () {
    const bodyData = this.ctx.request.body || {}

    const { data: detailInfo } = await this.service.center.noauth.api(
      '/api/core/table/detail',
      { _id: bodyData.template_id, },
    )

    if (!detailInfo) {
      this.ctx.body = this.app.xinError.basicError(null, '安装失败！该资源未找到，请联系服务商')
      return
    }

    const count = await this.service.table.main.count({
      _id: detailInfo?._id,
    })
    if (count > 0) {
      this.ctx.body = this.app.xinError.basicError(null, '数据表已存在')
      return
    }

    // 新增数据表
    const result = await this.service.center.market.table_insert(detailInfo, {
      comment: `从模板市场-数据表安装，时间：${this.app.dayjs.tz().format('YYYY-MM-DD HH:mm:ss')}`,
    })

    // 新增虚拟字段
    // TODO

    // 新增关联的数据字典
    const dictionary_ids = detailInfo.fields?.filter(a => [ 'radio', 'checkbox', 'select', 'multipleSelect', ].includes(a.moduleType)).map(a => a.data?.attributes?.dictionary_id).filter(Boolean)
    const listRes = await this.service.center.noauth.api(
      '/api/core/business/dictionary/list',
      {
        filter: {
          $or: [
            { _id: { $in: dictionary_ids, }, },
            { dictionary_id: { $in: dictionary_ids, }, },
          ],
        },
        pageSize: 10000,
      },
    )
    const detailList = listRes?.data?.data || []
    // console.log('------result--', result, detailInfo)
    // return
    await this.service.center.market.dictionary_insert(detailList, {
      comment: `从模板市场-数据表[${detailInfo.name}]安装，时间：${this.app.dayjs.tz().format('YYYY-MM-DD HH:mm:ss')}`,
    })

    // 通知其他进程重新构建Schema
    if (result?._id) {
      this.app.messenger.broadcast('refreshMongoModel', { table_id: result?._id, })
    }

    this.ctx.body = this.app.xinError.success({ _id: result?._id })
  }



  // 全部数据表列表
  async dictionary_list () {
    const bodyData = this.ctx.request.body || {}

    const result = await this.service.center.noauth.api(
      '/api/core/table/record/list',
      bodyData,
    )

    this.ctx.body = result
  }

  async dictionary_update () {
    const bodyData = this.ctx.request.body || {}

    const result = await this.service.center.noauth.api(
      '/api/core/table/record/update',
      bodyData,
    )

    this.ctx.body = result
  }

  async dictionary_install () {
    const token_user_id = this.ctx.xinToken?.user_id || undefined

    const bodyData = this.ctx.request.body || {}


    const listRes = await this.service.center.noauth.api(
      '/api/core/business/dictionary/list',
      {
        filter: {
          $or: [
            { _id: bodyData.template_id, },
            { dictionary_id: bodyData.template_id, },
          ],
        },
        pageSize: 10000,
      },
    )

    const detailList = listRes?.data?.data || []
    const detailInfo = detailList.find(a => !a.dictionary_id)

    const count = await this.service.business.dictionary.count({
      _id: detailInfo?._id,
    })
    if (count > 0) {
      this.ctx.body = this.app.xinError.basicError(null, '数据字典已存在')
      return
    }

    const result = await this.service.center.market.dictionary_insert(detailList, {
      comment: `从模板市场-数据字典安装，时间：${this.app.dayjs.tz().format('YYYY-MM-DD HH:mm:ss')}`,
    })
    this.ctx.body = this.app.xinError.success(result)
  }




  // 全部用户标签列表
  async usertag_list () {
    const bodyData = this.ctx.request.body || {}

    const result = await this.service.center.noauth.api(
      '/api/core/table/record/list',
      bodyData,
    )

    this.ctx.body = result
  }

  async usertag_update () {
    const bodyData = this.ctx.request.body || {}

    const result = await this.service.center.noauth.api(
      '/api/core/table/record/update',
      bodyData,
    )

    this.ctx.body = result
  }

  async usertag_install () {
    const token_user_id = this.ctx.xinToken?.user_id || undefined

    const bodyData = this.ctx.request.body || {}

    const tagRes = await this.service.center.noauth.api(
      '/api/core/user/tag/list',
      {
        filter: {
          _id: { $in: bodyData.template_ids || [], },
          type: { $in: ['outside', 'inside'], },
        },
        pageSize: 10000,
      },
    )

    const detailList = tagRes?.data?.data || []
    // console.log('detailList', detailList, bodyData)

    // 新增用户标签
    const result = await this.service.center.market.usertag_insert(detailList, {
      comment: `从模板市场-用户标签安装，时间：${this.app.dayjs.tz().format('YYYY-MM-DD HH:mm:ss')}`,
    })

    this.ctx.body = this.app.xinError.success(result)
  }

}

module.exports = XinController
