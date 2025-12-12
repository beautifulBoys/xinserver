'use strict';
const fs = require('fs')
const axios = require('axios')
const BaseService = require('../../core/baseService')

class XinService extends BaseService {

  async info (data = {}) {
    const token_user_id = this.ctx.xinToken?.user_id || undefined

    const socketPath = this.xinConfig.paths.socketPath

    try {
      if (!fs.existsSync(socketPath)) {
        return
        // throw new Error('未挂载docker.sock，无法与docker通信')
      }

      // 创建一个 axios 实例，使用 Unix Socket
      const client = axios.create({
        socketPath,
        baseURL: 'http://localhost',
        timeout: 2000,
      })

      // 获取版本信息
      const [ versionRes, infoRes ] = await Promise.all([
        client.get('/version'),
        client.get('/info'),
      ])
      // console.log('--docker_info--', versionResp.data, infoResp.data)

      return {
        // Docker 版本
        dockerVersion: versionRes.data.Version,
        // CPU
        cpuCount: infoRes.data.NCPU,
        // 内存
        totalMem: Number(((infoRes.data.Memory || infoRes.data.MemTotal || 0) / 1024 / 1024 / 1024).toFixed(2)),
        // 系统名称
        osName: infoRes.data.OperatingSystem,
      }
    } catch (err) {
      return
    }
  }

  async container (data = {}) {
    const token_user_id = this.ctx.xinToken?.user_id || undefined

    const serverMap = {
      'mongo': this.app.xinConfig.MONGO_NAME,
      'xinserver': this.app.xinConfig.SERVER_NAME,
    }

    const socketPath = this.xinConfig.paths.socketPath
    const container = serverMap[data.container] || data.container
    const command = data.command
    const permission = data.permission || ''

    try {
      // 创建一个 axios 实例，使用 Unix Socket
      const client = axios.create({
        socketPath,
        baseURL: 'http://localhost',
        timeout: 20000,
      })

      if (container.includes(this.app.xinConfig.SERVER_NAME) && command === 'restart' && permission !== 'system') {
        await this.service.devops.docker.server_start_time()
        this.ctx.body = this.app.xinError.success(null, '正在重启中，请稍后刷新页面')
      }

      client.post(`/containers/${container}/${command}`).catch(err => {
        this.app.logger.warn(`重启命令触发：${container} => ${err.message}`)
      })
      return {}
    } catch (err) {
      this.ctx.throw(500, `操作失败：${err.message}`)
    }
  }

  // 更新服务启动时间
  async server_start_time () {
    const token_user_id = this.ctx.xinToken?.user_id || undefined

    // const accounts = await this.service.system.project.getAccount()

    const result = await this.service.system.option.upsert({
      key: this.xinConfig.keys.server_start_time_key,
      value: Date.now(),
    })

    return result
  }

}

module.exports = XinService
