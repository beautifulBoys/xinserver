
'use strict';

const BaseController = require('../../core/baseController')
const tableSdk = require('../../sdk/table')

class XinController extends BaseController {

  async list () {
    const bodyData = this.ctx.request.body || {}
    const filter = bodyData || {}

    const result = await this.service.table.main.list(filter)
    // this.service.table.main.system_list()

    this.ctx.body = this.app.xinError.success(result)
  }

  // 系统内置表
  async system_list () {
    const bodyData = this.ctx.request.body || {}

    const result = await this.service.table.main.system_list(bodyData)

    this.ctx.body = this.app.xinError.success(result)
  }

  async add () {
    const bodyData = this.ctx.request.body || {}

    const result = await this.service.table.main.add(bodyData)

    // 通知其他进程重新构建Schema
    this.app.messenger.broadcast('refreshMongoModel', { table_id: result?._id, })

		// 日志记录
		await this.service.log.main.add({ type: 'table_add', result: result?._id, })

    this.ctx.body = this.app.xinError.success(result)
  }

  async ai_create () {
    const token_user_id = this.ctx.xinToken?.user_id || undefined

    const bodyData = this.ctx.request.body || {}
    const data = bodyData || {}

    // 创建数据字典
    const fields = data.fields || []
    const dictionarys = []
    fields.forEach(module => {
      if (module.enum) {
        const dictionary_id = String(this.ObjectId())
        const itemdicts = [
          { _id: dictionary_id, name: `${data.name}_${module.data.attributes.title}`, state: 0, },
        ].concat(module.enum.map(a => ({ dictionary_id, name: a, state: 0, })))

        dictionarys.push(...itemdicts)
        delete module.enum
        module.data.attributes.dictionary_id = dictionary_id
      }
    })

    const session = await this.app.mongoose.startSession()
    let result
    try {
      await session.withTransaction(async () => {
        // 数据字典
        await this.app.models.xin_dictionary.Model.create(
          dictionarys.map(a => ({
            ...a,
            create_user_id: token_user_id,
          })),
          { session, }
        )
        // 新增数据表
        const res = await this.app.models.xin_table.Model.create(
          [
            {
              name: data.name,
              tablename: data.tablename,
              fields,
              create_user_id: token_user_id,
              comment: `AI智能建表，时间：${this.app.dayjs.tz().format('YYYY-MM-DD HH:mm:ss')}`,
            },
          ],
          { session, }
        )
        result = res?.[0]
      })
    } catch (err) {
      this.ctx.logger.error('[事务失败]', err, err.stack)
      throw err
    } finally {
      session.endSession()
    }

    // // 通知其他进程重新构建Schema
    this.app.messenger.broadcast('refreshMongoModel', { table_id: result?._id, })

		// // 日志记录
		await this.service.log.main.add({ type: 'table_add', result: result?._id, })

    this.ctx.body = this.app.xinError.success(result)
  }

  async update () {
    const bodyData = this.ctx.request.body || {}
		const filter = bodyData.filter || {}
		const data = bodyData.data || {}

    const result = await this.service.table.main.update({ filter, data, })
		// 日志记录
		await this.service.log.main.add({ type: 'table_update', result, })

    this.ctx.body = this.app.xinError.success(result)
  }

  async batchUpdate () {
    const bodyData = this.ctx.request.body || {}
    const filter = bodyData.filter || {}
    const data = bodyData.data || {}

    const result = await this.service.table.main.batchUpdate({ filter, data, })
		// 日志记录
		await this.service.log.main.add({ type: 'table_batchUpdate', result: undefined, })

    this.ctx.body = this.app.xinError.success(result)
  }

  async detail () {
    const bodyData = this.ctx.request.body || {}
		const filter = bodyData || {}

    const result = await this.service.table.main.detail(filter)
    // console.log('---db---', this.app.mongoose.connection.db)
    this.ctx.body = this.app.xinError.success(result)
  }

  async schema () {
    const bodyData = this.ctx.request.body || {}
		const filter = bodyData || {}

    const result = await this.service.table.main.schema(filter)

    this.ctx.body = this.app.xinError.success(result)
  }

  // 修改表名
  async update_tablename () {
    const bodyData = this.ctx.request.body || {}
		const data = bodyData || {}

    const result = await this.service.table.main.update_tablename(data)

    this.ctx.body = this.app.xinError.success(result)
  }

  async publish () {
    const bodyData = this.ctx.request.body || {}
    const _id = bodyData._id

    const draftRes = await this.service.table.draft.last({ table_id: _id, })

    const result = await this.service.table.main.update({
      filter: { _id, },
      data: {
        fields: draftRes?.fields,
        draft_id: draftRes?._id,
      },
    })
    // 通知其他进程重新构建Schema
    // console.log('---表发布，此时广播---', process.pid)
    this.app.messenger.broadcast('refreshMongoModel', { table_id: _id, })

		// 日志记录
		await this.service.log.main.add({ type: 'table_publish', result, })

    this.ctx.body = this.app.xinError.success(result)
  }

  async delete () {
    const bodyData = this.ctx.request.body || {}
    const filter = bodyData || {}

    const result = await this.service.table.main.delete(filter)
		// 日志记录
		await this.service.log.main.add({ type: 'table_delete', result: result?._id, })

    this.ctx.body = this.app.xinError.success(result)
  }

  async batchDelete () {
    const bodyData = this.ctx.request.body || {}
    const filter = bodyData || {}

    const result = await this.service.table.main.batchDelete(filter)
		// 日志记录
		await this.service.log.main.add({ type: 'table_batchDelete', result: undefined, })

    this.ctx.body = this.app.xinError.success(result)
  }
}

module.exports = XinController
