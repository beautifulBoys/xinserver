
'use strict';

const BaseController = require('../../core/baseController')

class XinController extends BaseController {

  // 获取列表
  async list () {
    const bodyData = this.ctx.request.body || {}

    if (!this.xinConfig?.official?.saas_app_table_id) {
      this.ctx.body = this.app.xinError.basicError(null, '应用表配置异常')
      return
    }
    const result = await this.service.official.app.list(bodyData)

    this.ctx.body = this.app.xinError.success(result)
  }

  // 更新查看次数和启用次数
  async update () {
    const bodyData = this.ctx.request.body || {}
		const filter = bodyData.filter || {}
		const data = bodyData.data || {}

    const _id = filter._id
    
    if (!this.xinConfig?.official?.saas_app_table_id) {
      this.ctx.body = this.app.xinError.basicError(null, '应用表配置异常')
      return
    }

    const script = 
      `({
        main: async function (contexts, data) {
          return new Promise(async (resolve, reject) => {
            // 此处编写纯函数，返回计算值
            // contexts._this 为后端环境的this
            const _this = contexts._this

            const res = await _this.app.models.xin_table_record.Model
                          .findByIdAndUpdate('${_id}', ${JSON.stringify(data, null, 2)}, { new: true })
                          .exec()

            resolve(res)
          })
        },
      })
      `
    const result = await this.service.devtool.db.script({ script, })

    this.ctx.body = this.app.xinError.success(result)
  }

}

module.exports = XinController
