



module.exports = (options) => {
  return async function getProject (ctx, next) {

    const xinConfig = ctx.app.xinConfig
    const xinError = ctx.app.xinError

    // console.log('---------进入解析projectId中间件---------', ctx.request.headers)
    const project = ctx.request?.headers?.['xins-project']

    ctx.xinProject = project

    if (ctx.xinProject) {
      await next() // 执行后续中间件
    } else {
      ctx.body = xinError.projectNotExistError()
    }
  }
}




