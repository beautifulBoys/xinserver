'use strict';

const BaseService = require('../../core/baseService')
const nodetools = require('@xinserver/tools/lib/node')
const { execSync, exec, } = require('child_process')
const path = require('path')
const axios = require('axios')
const fs = require('fs')

class XinService extends BaseService {

  async list ({ filter = {}, select = {}, pageSize = 20, current = 1, sort = {}, }) {
    const token_user_id = this.ctx.xinToken?.user_id || undefined

    const targetdir = path.join(this.xinConfig.paths.resourcePath, 'upgrade')
    let version = this.xinConfig.version
    const files = await this.app.xin.readdir(targetdir)
    const newfiles = []
    for (let i = 0; i < files.length; i++) {
      const filename = files[i]
      const fullpath = path.join(targetdir, filename)
      const stats = await this.app.xin.stat(fullpath)
      newfiles.push({
        name: filename,
        size: stats.size || 0,
        url: path.join('/resource/upgrade', filename),
        inset_url: path.join('/app/resource/upgrade', filename),
        create_time: this.app.dayjs.tz(stats.birthtime).valueOf(),
        update_time: this.app.dayjs.tz(stats.mtime).valueOf(),
      })
    }
    const newlist = newfiles.sort((a, b) => b.create_time - a.create_time)
    try {
      const content = fs.readFileSync('/xincore/code/package.json', 'utf-8')  // 同步读取文件
      const data = JSON.parse(content)
      version = data.version
    } catch (err) {}

    return { data: newlist, count: newlist.length, version, }
  }

  async add (data = {}) {
    const token_user_id = this.ctx.xinToken?.user_id || undefined

    const result = await new this.app.models.xin_devops_upgrade.Model({
      ...(data || {}),
      create_user_id: token_user_id,
    }).save()

    return result?.toObject?.()
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

    const result = await this.app.models.xin_devops_upgrade.Model
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

  async detail (filter = {}) {
    const token_user_id = this.ctx.xinToken?.user_id || undefined

    const filterQuery = this._mongoFilterCreate({
      ...(filter || {}),
    })

    const result = await this.app.models.xin_devops_upgrade.Model
                                  .findOne(filterQuery)
                                  .lean()
                                  .exec()

    return result
  }

  async delete (filter = {}) {
    const token_user_id = this.ctx.xinToken?.user_id || undefined

    const filterQuery = this._mongoFilterCreate({
      ...(filter || {}),
    })

    const result = await this.app.models.xin_devops_upgrade.Model
                                  .findOneAndDelete(filterQuery, {
                                    projection: { _id: 1, },
                                    lean: true,
                                  })
                                  .exec()

    return result
  }

}

module.exports = XinService
