'use strict';

const BaseService = require('../../core/baseService')
const mongoose = require('mongoose')
const _ = require('lodash')

class XinService extends BaseService {

  // get
  async get (key) {
    const result = await this.app.models.xin_redis.Model
                                  .findOne({
                                    key,
                                  })
                                  .exec()
    return result?.value
  }

  // set
  async set (key, value) {
    const result = await this.app.models.xin_redis.Model
                                  .updateOne({
                                    key,
                                  }, {
                                    $set: { key, value, },
                                  }, {
                                    upsert: true,
                                    new: true,
                                  })
                                  .exec()
    return result?.value
  }

  // delete

  async delete (key) {
    const result = await this.app.models.xin_redis.Model
                                  .deleteOne({
                                    key,
                                  })
                                  .exec()
    return result
  }

}

module.exports = XinService
