'use strict';

const BaseService = require('../../core/baseService')
const tableSdk = require('../../sdk/table')
const workflowSdk = require('../../sdk/workflow')
const mongoose = require('mongoose')

class XinService extends BaseService {

  async list ({ filter = {}, select = {}, populate = [], pageSize = 20, current = 1, sort = {}, }) {
    const token_user_id = this.ctx.xinToken?.user_id || undefined

    // 自定义表Schema创建
    const XinTable = this.app.models[filter.table_id || filter.tablename] || {}
    if (!XinTable.Model) return { data: [], count: 0, }

    const limit = pageSize || 20
    const skip = limit * ((current || 1) - 1)

    const filterQuery = this._mongoFilterCreate({
      status: filter.status === false ? false : true,
      ...(filter || {}),
      tablename: undefined,
      table_id: undefined,
    })
    // console.log('---filterQuery---', filterQuery)
    const listRes = XinTable.Model
                            .find(filterQuery)
                            .select({
                              ...(select || {}),
                            })
                            .skip(skip)
                            .limit(limit)
                            .populate(
                              Array.from(
                                [
                                  ...(XinTable.Populate || []),
                                  ...(populate || []),
                                ].reduce((map, item) => map.set(item.path, item), new Map())
                                 .values()
                              )
                            )
                            .sort({
                              ...(sort || {}),
                            })
                            .lean()
    const countRes = XinTable.Model.countDocuments(filterQuery).exec()
    // const statsRes = XinTable.Model
    //                         .find(filterQuery)
    //                         .select({
    //                           ...(select || {}),
    //                         })
    //                         .skip(skip)
    //                         .limit(limit)
    //                         .populate(
    //                           Array.from(
    //                             [
    //                               ...(XinTable.Populate || []),
    //                               ...(populate || []),
    //                             ].reduce((map, item) => map.set(item.path, item), new Map())
    //                              .values()
    //                           )
    //                         )
    //                         .sort({
    //                           ...(sort || {}),
    //                         })
    //                         .explain('executionStats')

    const result = await Promise.all([ listRes, countRes, ])

    return { data: result[0], count: result[1], stats: result[2], }
  }

  // 导出数据
  async export ({ filter = {}, pageSize = 200, current = 1, }) {
    const token_user_id = this.ctx.xinToken?.user_id || undefined

    const limit = pageSize || 20
    const skip = limit * ((current || 1) - 1)

    // 自定义表Schema创建
    const XinTable = this.app.models[filter.table_id || filter.tablename] || {}
    if (!XinTable.Model) return { data: [], count: 0, }

    const listRes = XinTable.Model
                            .find({
                            })
                            .select({})
                            .skip(skip)
                            .limit(limit)
                            .populate([])
                            .sort({})
                            .lean()
                            .exec()

    const countRes = XinTable.Model.countDocuments({}).exec()

    const result = await Promise.all([ listRes, countRes ])

    return { data: result[0], count: result[1], }
  }

  // 导入数据
  async import ({ filter = {}, data = {}, }) {
    const token_user_id = this.ctx.xinToken?.user_id || undefined

    // 自定义表Schema创建
    const XinTable = this.app.models[filter.table_id || filter.tablename] || {}
    if (!XinTable.Model) return

    try {
      const result = await XinTable.Model
                                  .insertMany(
                                    data?.records || [],
                                    {
                                      ordered: false,
                                      rawResult: false,
                                    }
                                  )

      return result
    } catch (err) {
      return err
    }
  }

  async count (filter = {}) {
    const token_user_id = this.ctx.xinToken?.user_id || undefined

    // 自定义表Schema创建
    const XinTable = this.app.models[filter.table_id || filter.tablename] || {}
    if (!XinTable.Model) return 0

    const filterQuery = this._mongoFilterCreate({
      status: filter.status === false ? false : true,
      ...(filter || {}),
      tablename: undefined,
      table_id: undefined,
    })

    const result = await XinTable.Model.countDocuments(filterQuery).exec()

    return result || 0
  }

  async add (data = {}) {
    const token_user_id = this.ctx.xinToken?.user_id || undefined

    // 自定义表Schema创建
    const XinTable = this.app.models[data.table_id || data.tablename] || {}
    if (!XinTable.Model) return

    const result = await new XinTable.Model({
      ...(data || {}),
      tablename: undefined,
      table_id: undefined,
      create_user_id: token_user_id,
    }).save()

    return result?.toObject?.()
  }

  async batchAdd ({ filter = {}, data = [], }) {
    const token_user_id = this.ctx.xinToken?.user_id || undefined

    // 自定义表Schema创建
    const XinTable = this.app.models[filter.table_id || filter.tablename] || {}
    if (!XinTable.Model) return

    const insertData = data.map(item => ({
      ...(item || {}),
      tablename: undefined,
      table_id: undefined,
      create_user_id: token_user_id,
    }))

    const result = await XinTable.Model
                                  .insertMany(
                                    insertData,
                                    { ordered: true, },
                                  )
                                  .exec()

    return result
  }

  async update ({ filter = {}, data = {}, }) {
    const token_user_id = this.ctx.xinToken?.user_id || undefined

    // 自定义表Schema创建
    const XinTable = this.app.models[filter.table_id || filter.tablename] || {}
    if (!XinTable.Model) return

    const filterQuery = this._mongoFilterCreate({
      ...(filter || {}),
      tablename: undefined,
      table_id: undefined,
    })

    const updateQuery = this._emptyValueFilters({
      ...(data || {}),
      update_time: Date.now(),
    })

    const result = await XinTable.Model
                                  .findOneAndUpdate(
                                    filterQuery,
                                    updateQuery,
                                    {
                                      new: true,
                                      useFindAndModify: false,
                                    }
                                  )
                                  .select({ _id: 1, })
                                  .lean()
                                  .exec()

    return result
  }

  async batchUpdate ({ filter = {}, data = {}, }) {
    const token_user_id = this.ctx.xinToken?.user_id || undefined

    // 自定义表Schema创建
    const XinTable = this.app.models[filter.table_id || filter.tablename] || {}
    if (!XinTable.Model) return

    const filterQuery = this._mongoFilterCreate({
      ...(filter || {}),
      tablename: undefined,
      table_id: undefined,
    })

    const updateQuery = this._emptyValueFilters({
      ...(data || {}),
      update_time: Date.now(),
    })

    const result = await XinTable.Model
                                  .updateMany(
                                    filterQuery,
                                    updateQuery,
                                    { new: true },
                                    (err, updatedDocument) => {
                                      if (err) {
                                        console.error(err);
                                      } else {
                                        // console.log(updatedDocument);
                                      }
                                    }
                                  )
                                  .exec()

    return result
  }

  async detail (filter = {}) {
    const token_user_id = this.ctx.xinToken?.user_id || undefined

    // 自定义表Schema创建
    const XinTable = this.app.models[filter.table_id || filter.tablename] || {}
    if (!XinTable.Model) return

    const filterQuery = this._mongoFilterCreate({
      ...(filter || {}),
      tablename: undefined,
      table_id: undefined,
    })

    const result = await XinTable.Model
                                  .findOne(filterQuery)
                                  .populate([
                                    ...(XinTable.Populate || []),
                                    { path: 'tableInfo', select: '_id name tablename fields' },
                                  ])
                                  .lean()
                                  .exec()

    return result
  }

  async delete (filter = {}) {
    const token_user_id = this.ctx.xinToken?.user_id || undefined

    // 自定义表Schema创建
    const XinTable = this.app.models[filter.table_id || filter.tablename] || {}
    if (!XinTable.Model) return

    const filterQuery = this._mongoFilterCreate({
      ...(filter || {}),
      tablename: undefined,
      table_id: undefined,
    })

    const result = await XinTable.Model
                                  .findOneAndDelete(filterQuery, {
                                    projection: { _id: 1, },
                                    lean: true,
                                  })
                                  .exec()

    return result
  }

  async batchDelete (filter = {}) {
    const token_user_id = this.ctx.xinToken?.user_id || undefined

    // 自定义表Schema创建
    const XinTable = this.app.models[filter.table_id || filter.tablename] || {}
    if (!XinTable.Model) return

    const filterQuery = this._mongoFilterCreate({
      ...(filter || {}),
      tablename: undefined,
      table_id: undefined,
    })

    const result = await XinTable.Model
                                  .deleteMany(filterQuery)
                                  .exec()

    return result
  }

}

module.exports = XinService
