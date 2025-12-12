
'use strict';

const BaseController = require('../../core/baseController')
const os = require('os')
const { execSync } = require('child_process')

class XinController extends BaseController {

  // 服务器信息
  async info () {
    const bodyData = this.ctx.request.body || {}

    const dockerInfo = await this.service.devops.docker.info()
    const machineInfo = await this.service.devops.machine.info()

    const result = {
      // 系统名称
      osName: dockerInfo?.osName,
      // CPU数
      cpus: dockerInfo?.cpuCount || 0,
      // 内存（GB）
      mems: dockerInfo?.totalMem || 0,
      // 磁盘
      disks: machineInfo?.diskTotal || 0,
      // Docker
      dockerVersion: dockerInfo?.dockerVersion || 'none',
    }

    this.ctx.body = this.app.xinError.success(result)
  }

  // 服务器状态
  async status () {
    const bodyData = this.ctx.request.body || {}

    const result = await this.service.devops.machine.status()

    this.ctx.body = this.app.xinError.success(result)
  }

  // 服务器-平均负载
  async loadinfo () {
    const bodyData = this.ctx.request.body || {}

    const result = await this.service.devops.machine.loadinfo()

    this.ctx.body = this.app.xinError.success(result)
  }

  // 服务器-CPU
  async cpuinfo () {
    const bodyData = this.ctx.request.body || {}

    const result = await this.service.devops.machine.cpuinfo()

    this.ctx.body = this.app.xinError.success(result)
  }

  // 服务器-内存
  async memoryinfo () {
    const bodyData = this.ctx.request.body || {}

    const result = await this.service.devops.machine.memoryinfo()

    this.ctx.body = this.app.xinError.success(result)
  }

  // 服务器-磁盘
  async diskinfo () {
    const bodyData = this.ctx.request.body || {}

    const result = await this.service.devops.machine.diskinfo()

    this.ctx.body = this.app.xinError.success(result)
  }

  // 服务器-网络
  async networkinfo () {
    const bodyData = this.ctx.request.body || {}

    const result = await this.service.devops.machine.networkinfo()

    this.ctx.body = this.app.xinError.success(result)
  }

}

module.exports = XinController
