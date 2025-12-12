'use strict';

const BaseService = require('../../core/baseService')
const nodetools = require('@xinserver/tools/lib/node')
const { execSync, exec, } = require('child_process')
const axios = require('axios')
const path = require('path')
const fs = require('fs')

class XinService extends BaseService {

  async list ({ filter = {}, select = {}, pageSize = 20, current = 1, sort = {}, }) {
    const token_user_id = this.ctx.xinToken?.user_id || undefined

    const limit = pageSize || 20
    const skip = limit * ((current || 1) - 1)

    const filterQuery = this._mongoFilterCreate({
      status: filter.status === false ? false : true,
      ...(filter || {}),
    })

    const listRes = this.app.models.xin_devops_backup.Model
                            .find(filterQuery)
                            .select(select)
                            .skip(skip)
                            .limit(limit)
                            .populate([
                              { path: 'createUserInfo', select: '_id nickname name avatar' },
                            ])
                            .sort({
                              ...(sort || {}),
                            })
                            .lean()
                            .exec()
    const countRes = await this.app.models.xin_devops_backup.Model.countDocuments(filterQuery).exec()

    const result = await Promise.all([ listRes, countRes ])
    return { data: result[0], count: result[1], }
  }

  async count (filter = {}) {
    const token_user_id = this.ctx.xinToken?.user_id || undefined

    const filterQuery = this._mongoFilterCreate({
      status: filter.status === false ? false : true,
      ...(filter || {}),
    })

    const result = await this.app.models.xin_devops_backup.Model.countDocuments(filterQuery).exec()

    return result || 0
  }

  async add (data = {}) {
    const token_user_id = this.ctx.xinToken?.user_id || undefined

    const result = await new this.app.models.xin_devops_backup.Model({
      ...(data || {}),
      create_user_id: data.create_user_id || token_user_id,
    }).save()

    return result?.toObject?.()
  }

  async project_backup ({ filename, record_id, }) {
    const token_user_id = this.ctx.xinToken?.user_id || undefined

    const baseurl = `/resource/backup/project`
    const shellPath = path.join(this.app.baseDir, 'shell/pjbackup.sh')
    const url = `${baseurl}/${filename}`
    const inset_url = `/app${url}`

    try {

      console.log('执行项目备份开始啦')

      await fs.promises.mkdir(baseurl, { recursive: true })

      const output = await new Promise((resolve, reject) => {
        exec(`sh ${shellPath} ${filename}`, { stdio: 'pipe', encoding: 'utf-8', }, (err, stdout, stderr) => {
          if (err) {
            console.error(err, stderr || stdout)
          }
          resolve(stdout)
        })
      })

      // 更新备份结果-成功
      const stats = await fs.promises.stat(inset_url)
      await this.service.devops.pjbackup.update({
        filter: { _id: record_id, },
        data: {
          url,
          inset_url,
          result: output,
          size: stats?.size,
          state: 'success',
        },
      })

      console.log('执行项目备份成功啦', output, stats) // 返回执行输出
    } catch (err) {
      console.error('项目备份出错', err)
      // this.ctx.throw(500, `备份失败：${err.message}`)
      // 更新备份结果-失败
      await this.service.devops.pjbackup.update({
        filter: { _id: record_id, },
        data: {
          result: err.message,
          state: 'failed',
        },
      })
    }
  }

  async update ({ filter = {}, data = {}, }) {
    const token_user_id = this.ctx.xinToken?.user_id || undefined

    const filterQuery = this._mongoFilterCreate({
      ...(filter || {}),
    })

    const updateQuery = this._emptyValueFilters({
      ...(data || {}),
      update_time: Date.now(),
    })

    const result = await this.app.models.xin_devops_backup.Model
                                  .findOneAndUpdate(
                                    filterQuery,
                                    updateQuery,
                                    { new: true }
                                  )
                                  .select({ _id: 1, })
                                  .lean()
                                  .exec()

    return result
  }

  async batchUpdate ({ filter = {}, data = {}, }) {
    const token_user_id = this.ctx.xinToken?.user_id || undefined

    const filterQuery = this._mongoFilterCreate({
      ...(filter || {}),
    })

    const updateQuery = this._emptyValueFilters({
      ...(data || {}),
      update_time: Date.now(),
    })

    const result = await this.app.models.xin_devops_backup.Model
                                  .updateMany(
                                    filterQuery,
                                    updateQuery,
                                    { new: true }
                                  )
                                  .exec()

    return result
  }

  async detail (filter = {}) {
    const token_user_id = this.ctx.xinToken?.user_id || undefined

    const filterQuery = this._mongoFilterCreate({
      ...(filter || {}),
    })

    const result = await this.app.models.xin_devops_backup.Model
                                  .findOne(filterQuery)
                                  .populate([
                                    { path: 'createUserInfo', select: '_id nickname name avatar' },
                                  ])
                                  .lean()
                                  .exec()

    return result
  }

  async delete (filter = {}) {
    const token_user_id = this.ctx.xinToken?.user_id || undefined

    const filterQuery = this._mongoFilterCreate({
      ...(filter || {}),
    })

    const result = await this.app.models.xin_devops_backup.Model
                                  .findOneAndDelete(filterQuery, {
                                    projection: { _id: 1, inset_url: 1, },
                                    lean: true,
                                  })
                                  .exec()
    console.log('---删除路径--', result)
    // 删除文件
    result && this.service.common.file.deleteFile(result.inset_url)

    return result
  }

  async batchDelete (filter = {}) {
    const token_user_id = this.ctx.xinToken?.user_id || undefined

    const filterQuery = this._mongoFilterCreate({
      ...(filter || {}),
    })

    const result = await this.app.models.xin_devops_backup.Model
                                  .deleteMany(filterQuery)
                                  .exec()

    return result
  }

}

module.exports = XinService
