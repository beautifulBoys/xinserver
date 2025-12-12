'use strict';

const BaseService = require('../../core/baseService')

class XinService extends BaseService {

  async component_list (data) {

    const result = await this.centerRequest('/api/core/screen/index/component_list', {
      ...(data || {}),
      filter: {
        ...(data?.filter || {}),
        type: 'component',
        component_status: true,
      },
    })

    return result
  }

  async block_list (data) {

    const result = await this.centerRequest('/api/core/screen/index/block_list', {
      ...(data || {}),
      filter: {
        ...(data?.filter || {}),
        type: 'block',
        component_status: true,
      },
    })

    return result
  }

}

module.exports = XinService
