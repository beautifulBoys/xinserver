'use strict';

const BaseService = require('../../core/baseService')

class XinService extends BaseService {

  // 数据表列表
  async api (url, data = {}) {

    const result = await this.centerRequest('/api/core/common/noauth', {
      url,
      data,
    })

    return result
  }

}

module.exports = XinService
