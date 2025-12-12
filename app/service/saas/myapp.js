'use strict';

const BaseService = require('../../core/baseService')

class XinService extends BaseService {

  // 自建或者三方应用
  async list ({ filter = {}, select = {}, pageSize = 20, current = 1, sort = {}, }) {
    const token_user_id = this.ctx.xinToken?.user_id || undefined

    const limit = pageSize || 1000
    const skip = limit * ((current || 1) - 1)

    const filterQuery = this._mongoFilterCreate({
      status: filter?.status === false ? false : true,
      ...(filter || {}),
    })

    const listRes = await this.app.models.xin_saas_myapp.Model
                            .find(filterQuery)
                            .select({
                              platform_type: 1,
                              from_type: 1,
                              name: 1,
                              logo: 1,
                              url: 1,
                              app_project_id: 1,
                              nocode_app_id: 1,
                              create_time: 1,
                            })
                            .populate([
                              { path: 'appProjectInfo', select: '_id logo name english_name unique_id welcome' },
                              // { path: 'nocodeAppInfo', select: '_id name' },
                            ])
                            .skip(skip)
                            .limit(limit)
                            .sort({
                              ...(sort || {}),
                            })
                            .lean()
                            .exec()
    const countRes = await this.app.models.xin_saas_myapp.Model.countDocuments(filterQuery).exec()

    const result = await Promise.all([ listRes, countRes ])
    return { data: result[0], count: result[1], }
  }

  // 用户有权限的应用
  async userApplist ({ filter = {}, select = {}, pageSize = 20, current = 1, sort = {}, }) {
    const token_user_id = this.ctx.xinToken?.user_id || undefined

    const limit = pageSize || 1000
    const skip = limit * ((current || 1) - 1)

    const filterQuery = this._mongoFilterCreate({
      status: true,
    })

    const listRes = await this.app.models.xin_saas_myapp.Model
                            .find(filterQuery)
                            .select({
                              platform_type: 1,
                              from_type: 1,
                              name: 1,
                              logo: 1,
                              url: 1,
                              app_project_id: 1,
                              nocode_app_id: 1,
                              create_time: 1,
                            })
                            .populate([
                              { path: 'appProjectInfo', select: '_id logo name english_name unique_id welcome' },
                              // { path: 'nocodeAppInfo', select: '_id name' },
                            ])
                            .skip(skip)
                            .limit(limit)
                            .sort({
                              ...(sort || {}),
                            })
                            .exec()
    const countRes = await this.app.models.xin_saas_myapp.Model.countDocuments(filterQuery).exec()

    const result = await Promise.all([ listRes, countRes ])
    return { data: result[0], count: result[1], }
  }

  // 自建或者三方应用
  async freelist ({ filter = {}, select = {}, pageSize = 20, current = 1, sort = {}, }) {
    const token_user_id = this.ctx.xinToken?.user_id || undefined

    const limit = pageSize || 1000
    const skip = limit * ((current || 1) - 1)

    const filterQuery = this._mongoFilterCreate({
      status: filter?.status === false ? false : true,
      ...(filter || {}),
      from_type: { $in: [ 'create', 'three', ] },
    })

    const listRes = await this.app.models.xin_saas_myapp.Model
                            .find(filterQuery)
                            .select({
                              from_type: 1,
                              platform_type: 1,
                              name: 1,
                              logo: 1,
                              url: 1,
                              nocode_app_id: 1,
                              create_time: 1,
                            })
                            .populate([
                              // { path: 'appProjectInfo', select: '_id logo name english_name welcome front_routers' },
                            ])
                            .skip(skip)
                            .limit(limit)
                            .sort({
                              ...(sort || {}),
                            })
                            .exec()
    const countRes = await this.app.models.xin_saas_myapp.Model.countDocuments(filterQuery).exec()

    const result = await Promise.all([ listRes, countRes ])
    return { data: result[0], count: result[1], }
  }

  // 应用市场安装的应用
  async marketlist ({ filter = {}, select = {}, pageSize = 20, current = 1, sort = {}, }) {
    const token_user_id = this.ctx.xinToken?.user_id || undefined

    const limit = pageSize || 1000
    const skip = limit * ((current || 1) - 1)

    const filterQuery = this._mongoFilterCreate({
      status: filter?.status === false ? false : true,
      ...(filter || {}),
      from_type: { $in: [ 'market', 'exchange', ] },
    })

    const listRes = await this.app.models.xin_saas_myapp.Model
                            .find(filterQuery)
                            .select({
                              from_type: 1,
                              platform_type: 1,
                              create_time: 1,
                              ...(select || {}),
                            })
                            .populate([
                              { path: 'appProjectInfo', select: '_id logo name english_name welcome front_routers' },
                            ])
                            .skip(skip)
                            .limit(limit)
                            .sort({
                              ...(sort || {}),
                            })
                            .exec()
    const countRes = await this.app.models.xin_saas_myapp.Model.countDocuments(filterQuery).exec()

    const result = await Promise.all([ listRes, countRes ])
    return { data: result[0], count: result[1], }
  }

  // 项目详情接口使用
  async project_list (data) {
    // const token_user_id = this.ctx.xinToken?.user_id || undefined

    const result = await this.app.models.xin_saas_myapp.Model
                            .find({
                              from_type: { $in: [ 'market', 'exchange', ] },
                              status: true,
                            })
                            .select({
                              app_project_id: 1,
                              license: 1,
                              from_type: 1,
                              platform_type: 1,
                              create_time: 1,
                            })
                            .populate([
                              { path: 'appProjectInfo', select: '_id logo name english_name unique_id welcome front_routers' },
                            ])
                            .skip(0)
                            .limit(1000)
                            .sort({
                              create_time: 1,
                            })
                            .exec()

    return { data: result, count: result?.length || 0 }
  }

  async count (filter = {}) {
    const token_user_id = this.ctx.xinToken?.user_id || undefined

    const filterQuery = this._mongoFilterCreate({
      status: filter?.status === false ? false : true,
      ...(filter || {}),
    })

    const result = await this.app.models.xin_saas_myapp.Model.countDocuments(filterQuery).exec()

    return result || 0
  }

  async add (data = {}) {
    const token_user_id = this.ctx.xinToken?.user_id || undefined

    const result = await new this.app.models.xin_saas_myapp.Model({
      ...(data || {}),
      create_user_id: token_user_id,
    }).save()

    return result?.toObject?.()
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

    const result = await this.app.models.xin_saas_myapp.Model
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

    const result = await this.app.models.xin_saas_myapp.Model
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

    const result = await this.app.models.xin_saas_myapp.Model
                                  .findOne(filterQuery)
                                  .populate([
                                    { path: 'nocodeAppInfo', },
                                  ])
                                  .lean()
                                  .exec()

    return result
  }

  async delete (filter = {}) {
    const token_user_id = this.ctx.xinToken?.user_id || undefined

    const filterQuery = this._mongoFilterCreate({
      ...(filter || {}),
    })

    const result = await this.app.models.xin_saas_myapp.Model
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

    const result = await this.app.models.xin_saas_myapp.Model
                                  .deleteMany(filterQuery)
                                  .exec()

    return result
  }

  // 初始化SaaS App信息
  async addSaasApp ({ app_project_id, expire_time, recordNumber, userNumber, platform_type, from_type, use_type, }) {
    const project_id = this.ctx.xinProject || undefined
    const token_user_id = this.ctx.xinToken?.user_id || undefined
    // 项目/组织相关
    const [ res1, ] = await Promise.all([
      this.app.models.xin_saas_myapp.Model.insertMany({ // 生成开通项目记录
        app_project_id,
        platform_type,
        from_type,
        use_type,
        license: {
          expire_time: this.app.dayjs.tz(expire_time).startOf('day').add(1, 'day').valueOf() - 1,
          recordNumber,
          userNumber,
        },
        comment: `projectID：${project_id}开通SaaS应用ID：${app_project_id}`
      }),
    ].filter(Boolean))
    return res1
  }

}

module.exports = XinService
