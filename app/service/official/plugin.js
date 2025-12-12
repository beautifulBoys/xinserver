'use strict';

const BaseService = require('../../core/baseService')
const tableSdk = require('../../sdk/table')

class XinService extends BaseService {

  async list ({ filter = {}, select = {}, pageSize = 20, current = 1, sort = {}, }) {
    const table_id = this.xinConfig?.official?.saas_plugin_table_id

    const limit = pageSize || 20
    const skip = limit * ((current || 1) - 1)

    const filterQuery = this._mongoFilterCreate({
      status: filter.status === false ? false : true,
      ...(filter || {}),
      table_id,
    })

    const listRes = this.app.models.xin_table_record.Model
                            .find(filterQuery)
                            .select(select)
                            .skip(skip)
                            .limit(limit)
                            .populate([
                              { path: 'createUserInfo', select: '_id nickname name' },
                            ])
                            .sort(sort)
                            .lean()
                            .exec()
    const countRes = await this.app.models.xin_table_record.Model.countDocuments(filterQuery).exec()

    const result = await Promise.all([ listRes, countRes ])
    return { data: result[0], count: result[1], }
  }

}

module.exports = XinService
