'use strict';

const BaseService = require('../../core/baseService')

class XinService extends BaseService {

  async list ({ filter = {}, select = {}, pageSize = 20, current = 1, sort = {}, }) {
    const token_user_id = this.ctx.xinToken?.user_id || undefined

    const limit = pageSize || 20
    const skip = limit * ((current || 1) - 1)

    const filterQuery = this._mongoFilterCreate({
      status: filter?.status === false ? false : true,
      ...(filter || {}),
      create_user_id: token_user_id,
    })

    const listRes = this.app.models.xin_favourite.Model
                            .find(filterQuery)
                            .select(select)
                            .skip(skip)
                            .limit(limit)
                            .populate([
                              // { path: 'createUserInfo', select: '_id nickname name' },
                            ])
                            .sort({
                              ...(sort || {}),
                            })
                            .lean()
                            .exec()
    const countRes = await this.app.models.xin_favourite.Model.countDocuments(filterQuery).exec()

    const result = await Promise.all([ listRes, countRes ])
    return { data: result[0], count: result[1], }
  }

  async exist (filter) {
    const token_user_id = this.ctx.xinToken?.user_id || undefined

    const filterQuery = this._mongoFilterCreate({
      status: filter?.status === false ? false : true,
      ...(filter || {}),
      create_user_id: token_user_id,
    })

    const result = await this.app.models.xin_favourite.Model
                                  .findOne(filterQuery)
                                  .lean()
                                  .exec()

    return result
  }

  async add (data = {}) {
    const token_user_id = this.ctx.xinToken?.user_id || undefined

    const result = await new this.app.models.xin_favourite.Model({
      ...(data || {}),
      create_user_id: token_user_id,
    }).save()

    return result?.toObject?.()
  }

  async delete (filter = {}) {
    const token_user_id = this.ctx.xinToken?.user_id || undefined

    const filterQuery = this._mongoFilterCreate({
      ...(filter || {}),
      create_user_id: token_user_id,
    })

    const result = await this.app.models.xin_favourite.Model
                                  .findOneAndDelete(filterQuery, {
                                    projection: { _id: 1, },
                                    lean: true,
                                  })
                                  .exec()

    return result
  }

}

module.exports = XinService
