
const err_11000_fieldMap = {
  tablename: '表名',
  fieldname: '字段名',
  name: '名称',
  email: '邮箱',
  mobile: '手机号',
  phone: '电话',
  username: '用户名',
  job_no: '工号',
}

module.exports = () => {
  return async function errorHandler(ctx, next) {
    try {
      await next()
    } catch (err) {
      console.error('--------error-------', err)
      // 所有的异常都在 app 上触发一个 error 事件，框架会记录一条错误日志
      ctx.app.emit('error', err, ctx)

      const status = err.status || 500
      // 生产环境时 500 错误的详细错误内容不返回给客户端，因为可能包含敏感信息
      // const error =
      //   status === 500 && ctx.app.config.env === 'prod'
      //     ? '网络服务异常'
      //     : err.message


      // 唯一索引 触发错误，统一解决
      if (err.code === 11000) {
        ctx.logger.warn('【索引约束】error:', err)
        const keyValue = err.keyValue || {}
        delete keyValue.project_id
        console.log('-----keyValue---', keyValue)
        const errtext = Object.keys(keyValue).map(k => `${err_11000_fieldMap[k] || '值'}: ${keyValue[k]}`).join(', ')
        err.message = `操作失败，${errtext} 已存在`
      }

      // 从 error 对象上读出各个属性，设置到响应中
      ctx.body = ctx.app.xinError.basicError(err, err.message)
      if (status === 422) {
        ctx.body.detail = err.errors
      }
      ctx.status = status
    }
  }
}
