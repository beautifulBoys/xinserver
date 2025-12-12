'use strict';

const mongoose = require('mongoose')
const BaseService = require('../../core/baseService')

class XinService extends BaseService {

  async list ({ filter = {}, select = {}, pageSize = 20, current = 1, sort = {}, }) {
    const token_user_id = this.ctx.xinToken?.user_id || undefined

    const limit = pageSize || 20
    const skip = limit * ((current || 1) - 1)

    const filterQuery = this._mongoFilterCreate({
      status: filter.status === false ? false : true,
      ...(filter || {}),
    })

    const listRes = this.app.models.xin_table.Model
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
    const countRes = await this.app.models.xin_table.Model.countDocuments(filterQuery).exec()

    const result = await Promise.all([ listRes, countRes ])
    return { data: result[0], count: result[1], }
  }

  // 系统内置数据表
  async system_list (filter = {}) {
    const token_user_id = this.ctx.xinToken?.user_id || undefined

// console.log('---models', this.app.models)
    const result = Object.values(this.app.models).map(item => {
      const Model = item.Model
      const options = Model.schema.options || {}
      return {
        tablename: options.collection,
        name: options.tableName,
        ispublic: options.ispublic,
      }
    }).filter(a => a.ispublic)

    return { data: result, count: result?.length || 0, }
  }

  async count (filter = {}) {
    const token_user_id = this.ctx.xinToken?.user_id || undefined

    const filterQuery = this._mongoFilterCreate({
      status: filter?.status === false ? false : true,
      ...(filter || {}),
    })

    const result = await this.app.models.xin_table.Model.countDocuments(filterQuery).exec()

    return result || 0
  }

  async add (data = {}) {
    const token_user_id = this.ctx.xinToken?.user_id || undefined

    const result = await new this.app.models.xin_table.Model({
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

    const result = await this.app.models.xin_table.Model
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

    const result = await this.app.models.xin_table.Model
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

    const result = await this.app.models.xin_table.Model
                                  .findOne(filterQuery)
                                  .populate([
                                    {
                                      path: 'virtuals',
                                      match: {
                                        status: true,
                                      },
                                    },
                                  ])
                                  .lean()
                                  .exec()

    return result
  }

  async update_tablename (data = {}) {
    const token_user_id = this.ctx.xinToken?.user_id || undefined

    // 这里要写事务，1. 修改表定义，2. 修改实体表名
    const session = await this.app.mongoose.startSession()

    try {
      await session.withTransaction(async () => {
        // 修改表定义
        const result = await this.service.table.main.update({
          filter: {
            _id: data.table_id,
          },
          data: {
            tablename: data.tablename,
          },
        })
        // 修改实体表
        const XinTable = this.app.models[data.table_id] || {}
        const result1 = await XinTable.Model?.collection.rename(data.tablename)
        // xinMongo 表模型 restore
        this.app.messenger.broadcast('refreshMongoModel', { table_id: data.table_id, })

        // console.log('---update_tablename---', data, result, result1, result2, this.app.models)

        return result
      })
    } catch (err) {
      this.ctx.logger.error('[事务失败]', err, err.stack)
      throw err
    } finally {
      session.endSession()
    }
  }

  async schema (filter = {}) {
    const token_user_id = this.ctx.xinToken?.user_id || undefined

    // const tabletype = filter?.tabletype || 'inset'
    const tablename = filter?.tablename
    const table_id = filter?.table_id

    function defaultValueFunc (item) {
      if (String(item.defaultValue).startsWith('function now()')) {
        return '当前时间（13位毫秒时间戳）'
      } else {
        return item.defaultValue
      }
    }

    function titleFunc (item) {
      if (item.path === '_id') {
        return '主键 ID'
      } else {
        return item.options?.title
      }
    }

    const Model = this.app.models?.[tablename]?.Model

    // console.log('--schema--', JSON.stringify(Model?.schema, null, 2))

    // 字段
    let fields = Object.values(Model?.schema.paths || {}).map(item => ({
      fieldname: item.path,
      name: titleFunc(item),
      type: item.instance,
      default: defaultValueFunc(item),
      comment: item.options?.enum_desc || '-',
    }))
    fields = [fields.at(-1), ...fields.slice(0, -1)]

    // 虚拟字段
    const virtuals = Object.values(Model?.schema.virtuals || {}).map(item => ({
      fieldname: item.path,
      ref: item.options?.ref,
      localField: item.options?.localField,
      foreignField: item.options?.foreignField,
      justOne: item.options?.justOne,
      comment: `${tablename}.${item.options?.localField} 关联 ${item.options?.ref}.${item.options?.foreignField}`,
    }))

    // 索引
    const indexes = (Model?.schema.indexes() || []).map(item => item[0])
    // console.log('--indexes--', indexes)

    return { fields, virtuals, indexes, }
  }

  async delete (filter = {}) {
    const token_user_id = this.ctx.xinToken?.user_id || undefined

    const filterQuery = this._mongoFilterCreate({
      ...(filter || {}),
    })

    // 这里要写事务，1. 删除表定义，2. 删除实体表，3， 删除xinMongo的表模型。
    const session = await this.app.mongoose.startSession()

    try {
      await session.withTransaction(async () => {
        // 删除表定义
        const result = await this.app.models.xin_table.Model
                                  .findOneAndDelete(filterQuery, {
                                    projection: { _id: 1, },
                                    lean: true,
                                  })
                                  .exec()
        // 删除实体表
        // 自定义表Schema创建
        const XinTable = this.app.models[filter._id] || {}
        const result1 = await XinTable.Model?.collection.drop()
        // 删除xinMongo表模型
        this.app.messenger.broadcast('refreshMongoModel', { table_id: filter._id, })
        // console.log('---delete---', result, result1, result2, this.app.mongoose.models)

        return result
      })
    } catch (err) {
      this.ctx.logger.error('[事务失败]', err, err.stack)
      throw err
    } finally {
      session.endSession()
    }

  }

  // 不起用
  async batchDelete (filter = {}) {
    const token_user_id = this.ctx.xinToken?.user_id || undefined

    const filterQuery = this._mongoFilterCreate({
      ...(filter || {}),
    })

    const result = await this.app.models.xin_table.Model
                                  .deleteMany(filterQuery)
                                  .exec()

    return result
  }

}

module.exports = XinService
