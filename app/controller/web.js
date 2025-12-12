'use strict';

const BaseController = require('../core/baseController')
const axios = require('axios')
const fs = require('fs')

class XinController extends BaseController {

  // 返回首页
  async indexhtml () {
    const bodyData = this.ctx.request.body || {}
    
    this.ctx.type = 'html'

    this.ctx.body = fs.createReadStream(this.xinConfig.paths.publicPath + '/index.html')
  }

  // 返回 config.js
  async configjs () {
    const bodyData = this.ctx.request.body || {}
    
    this.ctx.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
    this.ctx.set('Pragma', 'no-cache')
    this.ctx.set('Expires', '0')
    this.ctx.type = 'application/javascript'

    this.ctx.body = fs.createReadStream(this.xinConfig.paths.frontConfigFile)
  } 

}

module.exports = XinController
