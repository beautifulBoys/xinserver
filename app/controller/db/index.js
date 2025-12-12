
'use strict';

const BaseController = require('../../core/baseController')
const path = require('path')
const mongoose = require('mongoose')

class XinController extends BaseController {

  // 自定义查询
  async model () {
    const bodyData = this.ctx.request.body || {}

    const allowFunctions = [ 'find', 'countDocuments', ]

    if (!bodyData.collection) {
      this.ctx.body = this.app.xinError.basicError(null, '参数缺失：数据表 collection')
      return
    }
    if (!bodyData.function) {
      this.ctx.body = this.app.xinError.basicError(null, '参数缺失：方法名 function')
      return
    }
    if (!bodyData.params?.length) {
      this.ctx.body = this.app.xinError.basicError(null, '参数错误：方法名 params 不能为空')
      return
    }
    if (!allowFunctions.includes(bodyData.function)) {
      this.ctx.body = this.app.xinError.basicError(null, '参数错误：方法名 function 目前仅支持：' + allowFunctions.join(', '))
      return
    }

    const result = await this.service.db.index.model(bodyData)

    this.ctx.body = this.app.xinError.success({ data: result, })
  }

  // 自定义聚合，报表中使用
  async aggregate () {
    const bodyData = this.ctx.request.body || {}

    if (!bodyData.collection) {
      this.ctx.body = this.app.xinError.basicError(null, '参数缺失：数据表 collection')
      return
    }
    if (!bodyData.table_id) {
      this.ctx.body = this.app.xinError.basicError(null, '参数缺失：数据表ID table_id')
      return
    }

    const result = await this.service.db.index.aggregate(bodyData)

    this.ctx.body = this.app.xinError.success({ data: result, })
  }

  // 正常聚合，关联字段
  async aggregate1 () {
    const bodyData = this.ctx.request.body || {}

    const result = await this.app.models.xin_table_record.Model
                                  .aggregate([
                                    {
                                      $match: {
                                        table_id: this.ObjectId('6598d7e534dfe17913361a88'),
                                        status: true,
                                      },
                                    },
                                    {
                                      $lookup: {
                                        from: 'XinTableRecord',
                                        let: { targetId: '$input_9299b9ea7894' },
                                        pipeline: [
                                          {
                                            $match: {
                                              $expr: { $eq: ['$_id', { $toObjectId: '$$targetId' }] }
                                            }
                                          }
                                        ],
                                        as: 'input_info3',
                                      }
                                    },
                                    { $sort: { create_time: -1 } },
                                    { $skip: 0 },
                                    { $limit: 20 },
                                  ])

    this.ctx.body = this.app.xinError.success({ data: result, })
  }

}

module.exports = XinController
