'use strict';

const qiniu = require('qiniu')
const BaseController = require('../app/core/baseController')
const BaseService = require('../app/core/baseService')
const BaseSchedule = require('../app/core/baseSchedule')

class XinController extends BaseController {

  async cdn_token () {
    const bodyData = this.ctx.request.body || {}

    const options = await this.service.system.option.detail({ key: this.xinConfig.keys.qiniu_cdn_key, })

    if (!options) {
      this.ctx.body = this.app.xinError.basicError({}, '未配置七牛云上传')
      return
    }

    const result = await new XinService(this.ctx).cdn_token(options?.value)
    this.ctx.body = this.app.xinError.success(result)
  }

}

class XinService extends BaseService {
  
  async cdn_token (data) {
    const project_id = this.ctx.xinProject || undefined
    const token_user_id = this.ctx.xinToken?.user_id || undefined

    const options = data || {}

    const mac = new qiniu.auth.digest.Mac(options.AccessKey, options.SecretKey)
    const putPolicy = new qiniu.rs.PutPolicy({
      scope: options.bucket,
      expires: 3600, // 秒
      returnBody: `{
        "provider": "qiniu_cdn",
        "name": $(fname),
        "filename": $(fname),
        "url": "",
        "size": $(fsize),
        "mime_type": $(mimeType),

        "key": $(key),
        "ext": $(ext),
        "imageInfo": $(imageInfo),
        "bucket": $(bucket)
      }`,
    })
    const token = putPolicy.uploadToken(mac)
    return { token }
  }

}

class XinSchedule extends BaseSchedule {
  // 通过 schedule 属性来设置定时任务的执行间隔等配置
  static get schedule () {
    return {
      cron: '*/10 * * * * *',
      cronOptions: {
        tz: 'Asia/ShangHai', // 设置时区
      },
      type: 'worker',
      immediate: false,
      disable: false,
      // disable: process.env.NODE_ENV === 'development',
    }
  }

  // subscribe 是真正定时任务执行时被运行的函数
  async subscribe () {
    console.log('【定时任务 - 七牛key获取】开始执行')
    console.time('triggerTimeMessage')
    
    await this.main()

    console.log('【定时任务 - 七牛key获取】执行结束，结束时间：' + this.app.dayjs.tz().format('YYYY-MM-DD HH:mm:ss'))
    console.timeEnd('triggerTimeMessage')
  }

  main () {
    return new Promise(async (resolve, reject) => {
      
      console.log('---定时任务 pid---', process.pid)
      resolve()
    })
  }
}

class XinPlugin {
  constructor(app) {
    this.app = app
    this.name = 'example'
  }

  install() {
    this.app.plugins[this.name] = {
      Controller: XinController,
      Service: XinService,
    }

    // 注册路由
    this.app.pluginRouter.post(`/${this.name}/cdn_token`, ctx => new XinController(ctx).cdn_token())

    // 注册定时任务
    // this.registerSchedule()
  }

  // 注册定时任务
  registerSchedule() {
    // Egg.js 的 schedule 配置格式：{ scheduleClass, options }
    const scheduleConfig = {
      scheduleClass: XinSchedule,
      options: {}, // 可传递自定义参数（如果需要）
    };

    // 将定时任务添加到 app 的 schedule 列表中
    // 注意：Egg 会自动扫描 app/schedule 目录，也支持手动注册（插件场景推荐手动注册）
    if (!this.app.schedules) {
      this.app.schedules = [];
    }
    this.app.schedules.push(scheduleConfig);

    // 兼容 Egg 部分版本的手动加载逻辑（可选）
    if (this.app.loader && this.app.loader.loadSchedule) {
      this.app.loader.loadSchedule(XinSchedule);
    }
  }
}

module.exports = app => new XinPlugin(app).install()
