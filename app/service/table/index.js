'use strict';

const BaseService = require('../../core/baseService')

class XinService extends BaseService {

  async list ({ filter = {}, select = {}, pageSize = 20, current = 1, sort = {}, }) {
    const token_user_id = this.ctx.xinToken?.user_id || undefined

    // 自定义表Schema创建
    const XinTable = this.app.models[filter.table_id || filter.tablename] || {}
    if (!XinTable.Model) return { data: [], count: 0, }

    const indexes = await XinTable.Model.collection.indexes()

    return { data: indexes, count: indexes.length, }

  }

  async add (data = {}) {
    const token_user_id = this.ctx.xinToken?.user_id || undefined

    // 自定义表Schema创建
    const XinTable = this.app.models[data.table_id || data.tablename] || {}
    if (!XinTable.Model) return

    const field1 = Object.fromEntries(
      data.fields.map(a => [ a.field, a.type ])
    )

    const field2 = data.unique ? {
      unique: true,
      partialFilterExpression: Object.fromEntries(
        data.fields.map(a => [ a.field, { $exists: true } ])
      )
    } : {}

    const result = await XinTable.Model.collection.createIndex(field1, field2)

    return result?.toObject?.()
  }

  async delete (filter = {}) {
    const token_user_id = this.ctx.xinToken?.user_id || undefined

    // 自定义表Schema创建
    const XinTable = this.app.models[filter.table_id || filter.tablename] || {}
    if (!XinTable.Model) return

    const result = await XinTable.Model.collection.dropIndex(filter.name)

    return result
  }

}

module.exports = XinService
