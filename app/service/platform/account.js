'use strict';

const nodetools = require('@xinserver/tools/lib/node')
const Service = require("egg/index").Service
const BaseService = require('../../core/baseService')

class XinService extends BaseService {

  // 查询登录信息符合条件用户列表
  async userList (data) {
    const filterQuery = this._mongoFilterCreate({
      ...(data || {}),
      state: 0,
      status: true,
    })

    const result = this.app.models.xin_user.Model
                            .find(filterQuery)
                            .select({
                              avatar: 1,
                              name: 1,
                              password: 1,
                            })
                            .skip(0)
                            .limit(100)
                            .populate([
                            ])
                            .sort({
                              create_time: 1,
                            })
                            .exec()
    return result
  }

}

module.exports = XinService
