
'use strict';

const BaseController = require('../../core/baseController')
const os = require('os')
const fs = require('fs')
const { execSync } = require('child_process')


const containerCommands = [ 'start', 'stop', 'pause', 'unpause', 'restart', ]

class XinController extends BaseController {

  // 容器操作
  async container () {
    const bodyData = this.ctx.request.body || {}
    const data = bodyData || {}

    if (!fs.existsSync(this.xinConfig.paths.socketPath)) {
      this.ctx.body = this.app.xinError.basicError(null, '文件不存在，无法与服务通信')
      return
    }
    if (!data.container) {
      this.ctx.body = this.app.xinError.basicError(null, '容器名参数缺失')
      return
    }
    if (!/^[a-zA-Z0-9._-]+$/.test(data.container)) {
      this.ctx.body = this.app.xinError.basicError(null, '容器名格式不合法，请检查')
      return
    }
    if (!containerCommands.includes(data.command)) {
      this.ctx.body = this.app.xinError.basicError(null, '当前操作不支持')
      return
    }

    const result = await this.service.devops.docker.container(data)
		// 日志记录
		await this.service.log.main.add({ type: `devops_docker_${data.command}`, result, })

    this.ctx.body = this.app.xinError.success(result)
  }

}

module.exports = XinController
