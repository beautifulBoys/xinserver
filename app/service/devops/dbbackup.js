'use strict';

const BaseService = require('../../core/baseService')
const nodetools = require('@xinserver/tools/lib/node')
const { execSync, exec, } = require('child_process')
const axios = require('axios')
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

  async mongo_backup ({ filename, record_id, savePath, }) {
    const token_user_id = this.ctx.xinToken?.user_id || undefined

    const baseurl = `/resource/backup/mongo`
    fs.mkdirSync(savePath, { recursive: true })

    const socketPath = this.xinConfig.paths.socketPath
    const MONGO_NAME = this.app.xinConfig.MONGO_NAME
    const url = `${baseurl}/${filename}`
    const inset_url = `/app${url}`

    console.log('执行mongo备份开始啦')

    try {
      // 创建一个 axios 实例，使用 Unix Socket
      const client = axios.create({
        socketPath,
        baseURL: 'http://localhost',
        timeout: 5000,
      })

      // 1. 创建 exec
      const createExec = await client.post(`/containers/${MONGO_NAME}/exec`, {
        AttachStdout: false,
        AttachStderr: false,
        AttachStdin: false,
        Detach: true,
        Tty: false,
        Cmd: [
          "bash",
          "/root/shell/backup.sh",
          filename,
        ]
      })
      const execId = createExec.data.Id
      // 2. 启动 exec
      await client.post(`/exec/${execId}/start`, {
        Detach: true,
        Tty: false,
      })

      // 3. 等待备份完成（检测文件生成）
      let tryCount = 0
      while (tryCount < 300) { // 最多等5分钟
        if (fs.existsSync(inset_url)) {
          const stats = fs.statSync(inset_url)
          if (stats.size > 0) {
            await this.service.devops.dbbackup.update({
              filter: { _id: record_id, },
              data: {
                url,
                inset_url,
                size: stats?.size,
                result: '备份成功',
                state: 'success',
              },
            })
          }
        }
        await new Promise(r => setTimeout(r, 1000))
        tryCount++
      }

      this.ctx.throw(500, `备份超时`)
    } catch (err) {
      // 更新备份结果-失败
      await this.service.devops.dbbackup.update({
        filter: { _id: record_id, },
        data: {
          result: err.message,
          state: 'failed',
        },
      })
      console.error('mongo备份出错', err)
      this.ctx.throw(500, `备份失败：${err.message}`)
    }
  }

  async mongo_restore ({ filename, record_id, }) {
    const token_user_id = this.ctx.xinToken?.user_id || undefined

    const socketPath = this.xinConfig.paths.socketPath
    const MONGO_NAME = this.app.xinConfig.MONGO_NAME

    console.log('执行mongo恢复开始啦')

    try {
      // 创建一个 axios 实例，使用 Unix Socket
      const client = axios.create({
        socketPath,
        baseURL: 'http://localhost',
        timeout: 20000,
      })

      // 1. 创建 exec
      const createExec = await client.post(`/containers/${MONGO_NAME}/exec`, {
        AttachStdout: true,
        AttachStderr: true,
        AttachStdin: false,
        Detach: false,
        Tty: false,
        Cmd: [
          "bash",
          "/root/shell/restore.sh",
          filename,
        ]
      })
      const execId = createExec.data.Id
      // 2. 启动 exec
      const startExec = await client.post(`/exec/${execId}/start`, {
        Detach: false,
        Tty: false,
      })

      // 更新恢复结果-成功
      await this.service.devops.dbbackup.update({
        filter: { _id: record_id, },
        data: {
          result: startExec?.data,
          state: 'success',
        },
      })

      console.log('执行mongo恢复成功啦', startExec.data) // 返回执行输出
      return true
    } catch (err) {
      // 更新恢复结果-失败
      await this.service.devops.dbbackup.update({
        filter: { _id: record_id, },
        data: {
          result: err.message,
          state: 'failed',
        },
      })
      console.error('mongo恢复出错', err)
      this.ctx.throw(500, `恢复失败：${err.message}`)
    }
  }

  // 上传备份
  async mongo_upload ({ file, targetUrl, data, }) {
    const token_user_id = this.ctx.xinToken?.user_id || undefined

    const url = '/resource/' + targetUrl.split('/resource/')[1]
    const inset_url = `/app${url}`

    const fileInfo = this.service.common.file.saveFile({ file, targetUrl: targetUrl })

    const result = await this.service.devops.dbbackup.add({
      ...(data || {}),
      name: file.filename,
      url,
      inset_url,
      size: fileInfo?.size,
      result: fileInfo,
      state: 'success',
    })

    return result
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
    this.service.common.file.deleteFile(result.inset_url)

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
