


const nodetools = require('@xinserver/tools/lib/node')

module.exports = (options) => {
  return async function getToken (ctx, next) {

    const xinConfig = ctx.app.xinConfig
    const xinError = ctx.app.xinError
    
    // console.log('---------进入解析token中间件---------')
    const token = ctx.request?.headers?.['xins-token']
    const project_id = ctx.request?.headers?.['xins-project']

    if (token) {
      try {
        const decoded = nodetools.jwt_verify(token)
				if (decoded) {
          if (project_id && decoded.project_id && decoded.project_id !== project_id) {
            ctx.body = xinError.tokenNoPermissionError()
            ctx.logger.error(new Error('Token 出错 3002'), ctx.body)
            return
          }
          const count = await ctx.app.models.xin_token_black.Model.countDocuments({
            token,
            project_id: decoded.project_id,
            create_user_id: decoded.user_id,
          }).exec()
          if (count === 0) {
            ctx.xinToken = { ...decoded, token, }
          } else {
            ctx.body = xinError.tokenInvalidError()
            ctx.logger.error(new Error('Token 出错 3000'), count, ctx.body)
          }
				} else {
          throw new Error('token解析错误')
        }
      } catch (err) {
        console.error(err)
        ctx.body = xinError.tokenParseError()
        ctx.logger.error(new Error('Token 出错 3001'), err, ctx.body)
      }
      if (ctx.xinToken) {
        await next() // 执行后续中间件
      }
    } else {
      ctx.body = xinError.tokenNotExistError()
      ctx.logger.error(new Error('Token 出错 3002'), ctx.body)
    }
  }
}




