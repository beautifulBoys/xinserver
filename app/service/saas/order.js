'use strict';

const BaseService = require('../../core/baseService')

class XinService extends BaseService {

  async list ({ filter = {}, select = {}, pageSize = 20, current = 1, sort = {}, }) {
    const token_user_id = this.ctx.xinToken?.user_id || undefined

    const limit = pageSize || 1000
    const skip = limit * ((current || 1) - 1)

    const filterQuery = this._mongoFilterCreate({
      status: filter?.status === false ? false : true,
      ...(filter || {}),
    })

    const listRes = await this.app.models.xin_saas_order.Model
                            .find(filterQuery)
                            .select({
                              ...(select || {}),
                            })
                            .populate([
                              { path: 'appProjectInfo', select: '_id logo name english_name welcome front_routers' },
                              { path: 'createUserInfo', select: '_id nickname name' },
                            ])
                            .skip(skip)
                            .limit(limit)
                            .sort({
                              ...(sort || {}),
                            })
                            .lean()
                            .exec()
    const countRes = await this.app.models.xin_saas_order.Model.countDocuments(filterQuery).exec()

    const result = await Promise.all([ listRes, countRes ])
    return { data: result[0], count: result[1], }
  }

  async add (data = {}) {
    const token_user_id = this.ctx.xinToken?.user_id || undefined

    const result = await new this.app.models.xin_saas_order.Model({
      ...(data || {}),
      create_user_id: token_user_id,
    }).save()

    return result?.toObject?.()
  }

}

module.exports = XinService
