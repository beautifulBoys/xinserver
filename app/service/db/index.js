'use strict';

const BaseService = require('../../core/baseService')
const mongoose = require('mongoose')
const _ = require('lodash')

class XinService extends BaseService {

  // 自定义查询
  async model (data) {
    const token_user_id = this.ctx.xinToken?.user_id || undefined
    

    data.params[0] = _.merge({
      ...(data.params[0] || {}),
    })

    // console.log('---db_model---', JSON.stringify(data.params[0], null, 2))
    const result = await this.app.models[data.collection].Model
                                  [data.function](...(data.params || []))
                                  .select(data.select)
                                  .skip(data.skip)
                                  .limit(data.limit)
                                  .populate(data.populate || [])
                                  .sort({
                                    ...(data.sort || {}),
                                  })
                                  .exec()
    return result
  }

  // 自定义聚合，报表中使用
  async aggregate (data) {
    const token_user_id = this.ctx.xinToken?.user_id || undefined
    

    const result = await this.app.models[data.collection].Model
                                  .aggregate([
                                    {
                                      $match: {
                                        table_id: data.table_id ? this.ObjectId(data.table_id) : undefined,
                                      },
                                    },
                                    ...(data.aggregate || [])
                                  ])
    return result
  }

}

module.exports = XinService
