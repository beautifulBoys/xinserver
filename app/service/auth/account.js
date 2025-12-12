'use strict';

const nodetools = require('@xinserver/tools/lib/node')
const Service = require("egg/index").Service
const BaseService = require('../../core/baseService')

class XinService extends BaseService {

  async exist (data) {
    const token_user_id = this.ctx.xinToken?.user_id || undefined

    const result = await this.app.models.xin_user.Model
                                  .findOne({
                                    ...(data || {}),
                                  })
                                  .exec()

    return result
  }

  async createToken (data, days) {
    const token_user_id = this.ctx.xinToken?.user_id || undefined

    data = JSON.parse(JSON.stringify(data))

    const token = nodetools.jwt_sign(data, days || this.app.xinConfig.token_expireTime || '10d')
    return String(token)
  }

  async setToken ({ _id, token }) {
    const token_user_id = this.ctx.xinToken?.user_id || undefined

    const result = await this.app.models.xin_user.Model
                                  .findOneAndUpdate({
                                    _id,
                                  }, {
                                    $push: { token },
                                  }, { new: true })
                                  .exec()

    return result
  }

  async clearToken ({ _id, }) {
    const token_user_id = this.ctx.xinToken?.user_id || undefined
    const current_token = this.ctx.xinToken?.token || undefined

    if (true) {
      // 只删除当前token
      const result = await this.app.models.xin_user.Model
                                    .findOneAndUpdate({
                                      _id,
                                    }, {
                                      $pull: { token: current_token, },
                                    }, { new: true })
                                    .exec()
      const tokens = [ current_token, ].map(token => ({ token: token, create_user_id: token_user_id, }))
      await this.app.models.xin_token_black.Model.insertMany(tokens)
      return result
    } else {
      // 删除所有的token
      const result = await this.app.models.xin_user.Model
                                    .findOneAndUpdate({
                                      _id,
                                    }, {
                                      token: [],
                                    }, { new: false })
                                    .exec()
      // 将所有的token加入黑名单
      const tokens = (result?.token || []).map(token => ({ token: token, create_user_id: token_user_id, }))
      tokens?.length && await this.app.models.xin_token_black.Model.insertMany(tokens)
      return result
    }

  }

}

module.exports = XinService
