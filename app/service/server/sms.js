
'use strict';

const BaseService = require('../../core/baseService')

class XinService extends BaseService {

  // 基础方法
  async send (data = {}) {
    const token_user_id = this.ctx.xinToken?.user_id || undefined

    try {
      const params = data.params || {}

      const result = await this.app.xinServer.sendSms({
        ...(data || {}),
        param: Object.keys(params).map(field => `**${field}**:${String(params[field])}`).join(','),
      })
      return result
    } catch (err) {
      console.error('发送短信失败', err)
      this.ctx.logger.error('发送短信失败', err)
      return
    }
  }

  // 验证-短信验证码
  async check_smscode (data) {
    const token_user_id = this.ctx.xinToken?.user_id || undefined

    const lastInfo = await this.service.server.sms.last({
      type: 'sms_code',
      mobile: data.mobile,
    })

    if (lastInfo && lastInfo.params && !lastInfo.checked && Date.now() - lastInfo.create_time < lastInfo.params.minutes * 60000 && data.captcha === lastInfo.params.code) {
      await this.service.server.sms.update(lastInfo._id, {
        checked: true,
      })
      return lastInfo
    } else {
      return
    }
  }


  async last (data) {
    const token_user_id = this.ctx.xinToken?.user_id || undefined

    const result = await this.app.models.xin_sms_record.Model
                                  .findOne({
                                    type: data.type,
                                    mobile: data.mobile,
                                    checked: false,
                                    status: true,
                                  })
                                  .sort({
                                    create_time: -1,
                                  })
                                  .lean()
                                  .exec()

    return result
  }


  async add (data) {
    const token_user_id = this.ctx.xinToken?.user_id || undefined

    const result = await new this.app.models.xin_sms_record.Model({
      ...data,
      create_user_id: token_user_id,
    }).save()

    return result?.toObject?.()
  }


  async update (_id, data) {
    const token_user_id = this.ctx.xinToken?.user_id || undefined

    const result = await this.app.models.xin_sms_record.Model
                                  .findByIdAndUpdate(_id, {
                                    ...data,
                                    update_time: Date.now(),
                                  }, { new: true })
                                  .select({ _id: 1, })
                                  .lean()
                                  .exec()

    return result
  }


}

module.exports = XinService



