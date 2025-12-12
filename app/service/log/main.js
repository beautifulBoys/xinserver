'use strict';

const BaseService = require('../../core/baseService')
const nodetools = require('@xinserver/tools/lib/node')

class XinService extends BaseService {

  async list ({ filter = {}, select = {}, pageSize = 20, current = 1, sort = {}, }) {
    const token_user_id = this.ctx.xinToken?.user_id || undefined

    const limit = pageSize || 20
    const skip = limit * ((current || 1) - 1)

    const filterQuery = this._mongoFilterCreate({
      status: filter.status === false ? false : true,
      ...(filter || {}),
    })

    const listRes = this.app.models.xin_log.Model
                            .find(filterQuery)
                            .select(select)
                            .skip(skip)
                            .limit(limit)
                            .populate([
                              { path: 'createUserInfo', select: '_id nickname name' },
                            ])
                            .sort({
                              ...(sort || {}),
                            })
                            .lean()
                            .exec()
    const countRes = await this.app.models.xin_log.Model.countDocuments(filterQuery).exec()

    const result = await Promise.all([ listRes, countRes ])
    return { data: result[0], count: result[1], }
  }

  async count (filter = {}) {
    const token_user_id = this.ctx.xinToken?.user_id || undefined

    const filterQuery = this._mongoFilterCreate({
      status: filter.status === false ? false : true,
      ...(filter || {}),
    })

    const result = await this.app.models.xin_log.Model.countDocuments(filterQuery).exec()

    return result || 0
  }

  async add ({ type, status, create_user_id, token, result, description, }) {
    const token_user_id = this.ctx.xinToken?.user_id || undefined

    const logTypeMap = this.app.xinConfig.logTypeMap
		const newtoken = token || this.ctx.xinToken?.token || undefined
    const request = this.ctx.request

    const resultLog = await new this.app.models.xin_log.Model({
      api: request?.url,
      ip: request?.ip,
      create_user_token: newtoken,
      name: logTypeMap[type]?.name || '名称未定义',
      type,
      action_status: status,
      body: {
        '请求': request?.url,
        'TOKEN': newtoken,
        '入参': request?.body,
        '结果': result,
      },
      description,
      create_user_id: create_user_id || token_user_id,
    }).save()

    return resultLog?.toObject?.()
  }

  // 自定义请求接口
  async add_customapi ({ type, status, create_user_id, result, description, requestData, token, request, }) {

    const logTypeMap = this.app.xinConfig.logTypeMap
    const tokenDecoded = nodetools.jwt_verify(token)
    const token_user_id = tokenDecoded?.user_id

    const resultLog = await new this.app.models.xin_log.Model({
      api: request.url,
      ip: request.ip,
      create_user_token: token,
      name: logTypeMap[type]?.name || '名称未定义',
      type,
      action_status: status,
      body: {
        '入参': requestData,
        '结果': result,
      },
      description,
      create_user_id: token_user_id,
    }).save()

    return resultLog
  }

  async update ({ filter = {}, data = {}, }) {
    const token_user_id = this.ctx.xinToken?.user_id || undefined

    const filterQuery = this._mongoFilterCreate({
      ...(filter || {}),
    })

    const updateQuery = this._emptyValueFilters({
      ...(data || {}),
      update_time: Date.now(),
    })

    const result = await this.app.models.xin_log.Model
                                  .findOneAndUpdate(
                                    filterQuery,
                                    updateQuery,
                                    { new: true }
                                  )
                                  .select({ _id: 1, })
                                  .lean()
                                  .exec()

    return result
  }

  async batchUpdate ({ filter = {}, data = {}, }) {
    const token_user_id = this.ctx.xinToken?.user_id || undefined

    const filterQuery = this._mongoFilterCreate({
      ...(filter || {}),
    })

    const updateQuery = this._emptyValueFilters({
      ...(data || {}),
      update_time: Date.now(),
    })

    const result = await this.app.models.xin_log.Model
                                  .updateMany(
                                    filterQuery,
                                    updateQuery,
                                    { new: true }
                                  )
                                  .exec()

    return result
  }

  async detail (filter = {}) {
    const token_user_id = this.ctx.xinToken?.user_id || undefined

    const filterQuery = this._mongoFilterCreate({
      ...(filter || {}),
    })

    const result = await this.app.models.xin_log.Model
                                  .findOne(filterQuery)
                                  .lean()
                                  .exec()

    return result
  }

  async delete (filter = {}) {
    const token_user_id = this.ctx.xinToken?.user_id || undefined

    const filterQuery = this._mongoFilterCreate({
      ...(filter || {}),
    })

    const result = await this.app.models.xin_log.Model
                                  .findOneAndDelete(filterQuery, {
                                    projection: { _id: 1, },
                                    lean: true,
                                  })
                                  .exec()

    return result
  }

  async batchDelete (filter = {}) {
    const token_user_id = this.ctx.xinToken?.user_id || undefined

    const filterQuery = this._mongoFilterCreate({
      ...(filter || {}),
    })

    const result = await this.app.models.xin_log.Model
                                  .deleteMany(filterQuery)
                                  .exec()

    return result
  }

}

module.exports = XinService
