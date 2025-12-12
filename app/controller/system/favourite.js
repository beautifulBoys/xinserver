
'use strict';

const BaseController = require('../../core/baseController')

class XinController extends BaseController {

  async list () {
    const bodyData = this.ctx.request.body || {}
		const filter = bodyData.filter || {}

		if (!filter.type) {
			return this.app.xinError.basicError(result, '类型type缺失')
		}
    const result = await this.service.system.favourite.list(bodyData)


    this.ctx.body = this.app.xinError.success(result)
  }

  async do () {
    const token_user_id = this.ctx.xinToken?.user_id || undefined

    const bodyData = this.ctx.request.body || {}
		const data = bodyData || {}

		if (!data?.type) {
			this.ctx.body = this.app.xinError.basicError({}, '类型type缺失')
      return
		}
		const favouriteInfo = await this.service.system.favourite.exist(data)

    if (favouriteInfo) {
			const result = await this.service.system.favourite.delete({ _id: favouriteInfo._id, })
      this.ctx.body = this.app.xinError.success(result, '取消收藏成功')
      // 日志记录
      await this.service.log.main.add({ type: 'system_favourite_delete', result: result?._id, })
		} else {
			const result = await this.service.system.favourite.add(data)
      this.ctx.body = this.app.xinError.success(result, '收藏成功')
      // 日志记录
      await this.service.log.main.add({ type: 'system_favourite_add', result: result?._id, })
		}
  }

}

module.exports = XinController
