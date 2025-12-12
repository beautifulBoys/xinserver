
const path = require('path')
const fs = require('fs')
// const cluster = require('cluster')
const xinConfig = require('./app/config/')
const xinError = require('./app/utils/xinError')
const compressExclude = require('./app/utils/compressExclude')
require('./app/utils/init')

const xin = require('./xin/')

const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc')
const timezone = require('dayjs/plugin/timezone')
const quarterOfYear = require('dayjs/plugin/quarterOfYear')
dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(quarterOfYear)
dayjs.tz.setDefault('Asia/Shanghai')

module.exports = (app) => {
  const env = app.config.env

  // 全局注册 dayjs
  app.dayjs = dayjs
  app.xinConfig = xinConfig
  app.xinError = xinError
  app.compressExclude = compressExclude
  app.plugins = {}

  app.xin = new xin.XinApp(app)
  app.xinMongo = new xin.XinMongo(app)
  app.xinPlugin = new xin.XinPlugin(app)
  app.xinServer = new xin.XinServer(app)
  app.xinQueue = new xin.XinQueue({ limit: 5, }, app)

  app.xinMongo.on('open', async () => {
    await app.xinServer.init()
    await app.xinPlugin.init()
  })

  app.beforeStart(async () => {
    // 此处是你原来的逻辑代码
  })

  app.ready(async () => {
    if (env === 'prod') {
    }
    // require('./plugins/qiniu')(app)
    // console.log('---', app.services)
    // await app.runSchedule('wx')
    // await app.runSchedule('statistic')
    // 在其中一个worker中执行代码，集群模式已关闭
    // if (cluster.worker?.id === 1) {
    // }
  })

  app.once('server', (server) => {
    // websocket
    console.log('服务-进程ID：', process.pid)
  })
  app.on('error', (err, ctx) => {
    // report error
    ctx?.logger?.error(new Error('出错'), err)
  })
  app.on('request', (ctx) => {
    // log receive request
    ctx?.logger?.info(`请求进入`)
  })
  app.on('response', (ctx) => {
    // ctx.starttime is set by framework
    // const usedtime = Date.now() - ctx.starttime;
    // ctx.logger?.info(`请求返回，时间：${usedtime}ms`)
    ctx?.logger?.info(`请求返回`)
  })
}