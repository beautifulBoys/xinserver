'use strict';

const BaseService = require('../../core/baseService')
const mongoose = require('mongoose')

class XinService extends BaseService {

  // 发送
  async send (data = {}) {
    const token_user_id = this.ctx.xinToken?.user_id || undefined

    const result = await this.app.xinServer.sendEmail({
      ...(data || {}),
    })

    return result
  }

  // 验证-短信验证码
  async check_emailcode (data) {
    const token_user_id = this.ctx.xinToken?.user_id || undefined

    const lastInfo = await this.service.server.email.last({
      type: 'email_code',
      email: data.email,
    })

    if (lastInfo && lastInfo.params && !lastInfo.checked && Date.now() - lastInfo.create_time < lastInfo.params.minutes * 60000 && data.captcha === lastInfo.params.code) {
      await this.service.server.email.update(lastInfo._id, {
        checked: true,
      })
      return lastInfo
    } else {
      return
    }
  }

  async last (data) {
    const token_user_id = this.ctx.xinToken?.user_id || undefined

    const result = await this.app.models.xin_email_record.Model
                                  .findOne({
                                    type: data.type,
                                    email: data.email,
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

    const result = await new this.app.models.xin_email_record.Model({
      ...data,
      create_user_id: token_user_id,
    }).save()

    return result?.toObject?.()
  }


  async update (_id, data) {
    const token_user_id = this.ctx.xinToken?.user_id || undefined

    const result = await this.app.models.xin_email_record.Model
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
