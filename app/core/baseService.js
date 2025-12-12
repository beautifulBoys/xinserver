'use strict'

const { Service } = require('egg')

class BaseService extends Service {
  constructor(ctx) {
    super(ctx)

    this.xinConfig = ctx.app.xinConfig

    this._emptyValueFilters = this.app.xin._emptyValueFilters
    this._mongoFilterCreate = this.app.xin._mongoFilterCreate
    this.ObjectId = this.app.xin.ObjectId

  }

  centerRequest (url, data, options = {}) {
    return new Promise(async (resolve, reject) => {
      try {
        const result = await this.ctx.curl(this.xinConfig.centerServerURL + (url || ''), {
          dataType: 'json',
          contentType: 'json',
          method: 'POST',
          timeout: 60000,
          headers: {
            'Content-Type': 'application/json',
            ...(options?.headers || {}),
          },
          data,
        })
        resolve(result?.data)
      } catch (err) {
        resolve()
      }
    })
  }

}

module.exports = BaseService
