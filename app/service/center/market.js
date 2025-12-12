'use strict';

const BaseService = require('../../core/baseService')

class XinService extends BaseService {

  // 批量插入数据表
  async table_insert (data, options) {
    const token_user_id = this.ctx.xinToken?.user_id || undefined

    try {
      const result = await this.service.table.main.add({
        _id: data._id,
        name: data.name,
        tablename: data.tablename,
        fields: data.fields,
        comment: options.comment,
      })

      return result
    } catch (err) {
      console.error(err)
      return
    }
  }

  // 批量插入数据字典
  async dictionary_insert (datas, options) {
    const token_user_id = this.ctx.xinToken?.user_id || undefined

    try {
      const result = await this.app.models.xin_dictionary.Model.insertMany(
        datas.map(item => ({
          _id: item._id,
          dictionary_id: item.dictionary_id,
          name: item.name,
          value: item.value,
          color: item.color,
          state: 0,
          comment: options.comment,
          create_user_id: token_user_id,
        })),
        { ordered: false, defaults: true, },
      )

      return result
    } catch (err) {
      console.error(err)
      return err.result
    }
  }

  // 批量插入用户标签
  async usertag_insert (datas, options) {
    const token_user_id = this.ctx.xinToken?.user_id || undefined

    try {
      const result = await this.app.models.xin_user_tag.Model.insertMany(
        datas.map(item => ({
          _id: item._id,
          name: item.name,
          type: item.type,
          comment: options.comment,
          create_user_id: token_user_id,
        })),
        { ordered: false, defaults: true, },
      )

      return result
    } catch (err) {
      console.error(err)
      return err.result
    }
  }

}

module.exports = XinService
