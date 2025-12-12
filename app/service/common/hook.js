'use strict';

const BaseService = require('../../core/baseService')

class XinService extends BaseService {

  // 支持一次生成多个编号。
  async get_unique_id (count = 1, startStr = '') {
    const token_user_id = this.ctx.xinToken?.user_id || undefined
    
    // 生成数量
    count = count || 1

    let result
    result = await this.app.models.xin_hook.Model.findOneAndUpdate({
                              type: 'unique_id',
                              status: true,
                            }, {
                              $inc: { unique_id: count },
                            }, { new: true, })
                            .exec()

    if (!result) {
      result = await new this.app.models.xin_hook.Model({
                              type: 'unique_id',
                              unique_id: 1001,
                            }).save()
    }
    startStr = startStr || ''
    const date = this.app.dayjs.tz().format('YYMMDD')
    const unique_id = result.unique_id
    // console.log('-----date-----', this.app.dayjs.tz().format('YYYY-MM-DD HH:mm:ss'))
    if (count > 1) {
      return Array(count).fill(1).map((item, index) => {
        return `${startStr}${date}${unique_id - count + index + 1}`
      })
    } else {
      return `${startStr}${date}${unique_id}`
    }
  }

  // 支持一次生成多个编号。
  async get_mongo_id (count = 1) {
    const token_user_id = this.ctx.xinToken?.user_id || undefined

    // 生成数量
    count = count || 1

    if (count > 1) {
      return Array(count).fill(1).map(a => {
        return this.ObjectId()
      })
    } else {
      return this.ObjectId()
    }
  }

}

module.exports = XinService
