'use strict';

const { Controller } = require('egg')

class BaseController extends Controller {
  constructor(ctx) {
    super(ctx)

    this.xinConfig = ctx.app.xinConfig

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

module.exports = BaseController
