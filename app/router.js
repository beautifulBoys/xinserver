'use strict';

module.exports = app => {

  // 设置全局路由前缀
  const router = app.router.namespace('/api/core')
  app.pluginRouter = app.router.namespace('/api/core/plugin')

  // WEB
  require('./router/web')(app)

  require('./router/common')({ ...app, router, })
  require('./router/basic')({ ...app, router, })
  require('./router/server')({ ...app, router, })
  // require('./router/workpage')({ ...app, router, })
  // require('./router/test')({ ...app, router, })
  // require('./router/plugin')({ ...app, router, })
  require('./router/center')({ ...app, router, })
  // require('./router/customapi')({ ...app, router, })
  require('./router/platform')({ ...app, router, })
  require('./router/plugin')({ ...app, router, })
  // require('./router/official')({ ...app, router, })
  // require('./router/saas')({ ...app, router, })

}
