

module.exports = (app) => {
  const { router, controller, config, middleware, } = app


  // 发送短信验证码
  router.post('/server/sms/send_smscode', controller.server.sms.send_smscode)
  router.post('/server/sms/send_sms', controller.server.sms.send_sms)

  // 发送邮箱验证码
  router.post('/server/email/send_emailcode', controller.server.email.send_emailcode)
  router.post('/server/email/send_email', controller.server.email.send_email)

  // AI
  router.post('/server/ai/text', controller.server.ai.text)
  router.post('/server/ai/deepseek_text', controller.server.ai.deepseek_text)
  router.post('/server/ai/moonshot_text', controller.server.ai.moonshot_text)

  // 微信服务号相关
  router.post('/server/wx/qrcode_create', controller.server.wx.qrcode_create)
  router.post('/server/wx/qrcode_loop', controller.server.wx.qrcode_loop)
  
  router.post('/server/wx/login', controller.server.wx.login)
  router.get('/server/wx/callback', controller.server.wx.callback_get)
  router.post('/server/wx/callback', controller.server.wx.callback_post)
  router.post('/server/wx/qrcode_create', controller.server.wx.qrcode_create)
  router.post('/server/wx/qrcode_loop', controller.server.wx.qrcode_loop)
  // router.post('/server/wx/send_template_message', controller.server.wx.send_template_message)
  // router.post('/server/wx/template_message_list', controller.server.wx.template_message_list)
  
  // devops
  // 数据库备份 dbbackup
  router.post('/devops/dbbackup/list', controller.devops.dbbackup.list)
  router.post('/devops/dbbackup/add', controller.devops.dbbackup.add)
  router.post('/devops/dbbackup/backup', controller.devops.dbbackup.backup)
  router.post('/devops/dbbackup/restore', controller.devops.dbbackup.restore)
  router.post('/devops/dbbackup/upload', controller.devops.dbbackup.upload)
  router.post('/devops/dbbackup/add', controller.devops.dbbackup.add)
  router.post('/devops/dbbackup/detail', controller.devops.dbbackup.detail)
  router.post('/devops/dbbackup/update', controller.devops.dbbackup.update)
  router.post('/devops/dbbackup/batchUpdate', controller.devops.dbbackup.batchUpdate)
  router.post('/devops/dbbackup/delete', controller.devops.dbbackup.delete)
  router.post('/devops/dbbackup/batchDelete', controller.devops.dbbackup.batchDelete)
  // 项目备份 pjbackup
  router.post('/devops/pjbackup/list', controller.devops.pjbackup.list)
  router.post('/devops/pjbackup/add', controller.devops.pjbackup.add)
  router.post('/devops/pjbackup/backup', controller.devops.pjbackup.backup)
  router.post('/devops/pjbackup/detail', controller.devops.pjbackup.detail)
  router.post('/devops/pjbackup/update', controller.devops.pjbackup.update)
  router.post('/devops/pjbackup/batchUpdate', controller.devops.pjbackup.batchUpdate)
  router.post('/devops/pjbackup/delete', controller.devops.pjbackup.delete)
  router.post('/devops/pjbackup/batchDelete', controller.devops.pjbackup.batchDelete)
  // 项目备份 pjbackup
  router.post('/devops/upgrade/list', controller.devops.upgrade.list)
  router.post('/devops/upgrade/upload', controller.devops.upgrade.upload)
  router.post('/devops/upgrade/install', controller.devops.upgrade.install)
  // router.post('/devops/upgrade/backup', controller.devops.upgrade.backup)
  router.post('/devops/upgrade/detail', controller.devops.upgrade.detail)
  router.post('/devops/upgrade/update', controller.devops.upgrade.update)
  router.post('/devops/upgrade/delete', controller.devops.upgrade.delete)


}

