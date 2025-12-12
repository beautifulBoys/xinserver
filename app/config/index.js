
const fs = require('fs')
const path = require('path')
// const nodetools = require('@xinserver/tools/lib/node')
const packageJson = require('../../package.json')

// 加载配置文件函数
function loadConfig () {
  const baseDir = path.resolve(__dirname, '../../data')
  const jsonPath = path.join(baseDir, 'config.json')
  const jsPath = path.join(baseDir, 'config.js')

  let customConfig = {}

  if (fs.existsSync(jsonPath)) {
    try {
      const jsonContent = fs.readFileSync(jsonPath, 'utf-8')
      customConfig = JSON.parse(jsonContent)
    } catch (err) {}
  } else if (fs.existsSync(jsPath)) {
    try {
      // 删除 require 缓存，确保每次都能加载最新内容
      delete require.cache[require.resolve(jsPath)]
      customConfig = require(jsPath)
    } catch (err) {}
  } else {
  }

  return customConfig
}

function createLogFunc (name, type) {
	const actions = [
		{ action: 'add', name: '新增', },
		{ action: 'update', name: '更新', },
		{ action: 'batchUpdate', name: '批量更新', },
		{ action: 'delete', name: '删除', },
		{ action: 'batchDelete', name: '批量删除', },
	]
	
	const result = actions.map(action => [
		type + '_' + action.action,
		{ name: action.name + name }
	])

	return Object.fromEntries(result)
}

const logTypeMap = {
	// 账号
	account_login: { name: '账号登录', },
	platform_login: { name: '平台账号登录', },
	account_logout: { name: '退出登录', },
	// 画面
	...createLogFunc('画面', 'screen'),
	screen_publish: { name: '发布画面', },
	...createLogFunc('画面分组', 'screen_group'),
	...createLogFunc('画面草稿', 'screen_draft'),
	// 数据表
	...createLogFunc('数据表', 'table'),
	table_publish: { name: '发布数据表', },
	...createLogFunc('数据表分组', 'table_group'),
	...createLogFunc('数据表记录', 'table_record'),
	...createLogFunc('数据表草稿', 'table_draft'),
	...createLogFunc('数据表索引', 'table_index'),
	...createLogFunc('数据表虚拟字段', 'table_virtual'),
	// 组织机构
	...createLogFunc('组织机构', 'organization'),
	// 用户
	...createLogFunc('用户', 'user'),
	...createLogFunc('用户角色', 'user_role'),
	...createLogFunc('用户标签', 'user_tag'),
	...createLogFunc('权限', 'user_permission'),
	// 系统相关
	...createLogFunc('数据字典', 'business_dictionary'),
	...createLogFunc('参数配置', 'business_config'),
	business_config_upsert: { name: '新增/更新参数配置', },
	
	...createLogFunc('收藏', 'system_favourite'),
	// 项目
	...createLogFunc('项目', 'project'),
	...createLogFunc('配置项', 'system_option'),
	system_option_upsert: { name: '新增/更新配置项', },
	// 工作流
	...createLogFunc('工作流', 'workflow'),
	workflow_publish: { name: '发布工作流', },
	workflow_alive_on: { name: '启用工作流', },
	workflow_alive_off: { name: '禁用工作流', },
	...createLogFunc('工作流记录', 'workflow_record'),
	...createLogFunc('工作流分组', 'workflow_group'),
	...createLogFunc('工作流草稿', 'workflow_draft'),
	...createLogFunc('工作流任务', 'workflow_task'),
	// 消息
	...createLogFunc('消息', 'message'),
	...createLogFunc('回复消息', 'message_reply'),
	// 公告通知
	...createLogFunc('公告', 'operation_notice'),
	...createLogFunc('消息通知', 'operation_message'),

	// 资源
	...createLogFunc('资源', 'resource'),
	...createLogFunc('资源分组', 'resource_group'),
	...createLogFunc('网页托管文件', 'resource_web'),

	// 拓展开发
	...createLogFunc('拓展应用', 'expand_app'),
	...createLogFunc('拓展授权', 'expand_token'),

	// 告警
	...createLogFunc('告警', 'warning'),

	// 报表
	...createLogFunc('报表', 'report'),
	...createLogFunc('报表分组', 'report_group'),
	...createLogFunc('报表视图', 'report_view'),
	...createLogFunc('报表记录', 'report_record'),

// const containerCommands = [ 'start', 'stop', 'pause', 'unpause', 'restart', ]
	// 运维 devops
	devops_docker_start: { name: '服务启动', },
	devops_docker_stop: { name: '服务停止', },
	devops_docker_pause: { name: '服务暂停', },
	devops_docker_unpause: { name: '服务恢复', },
	devops_docker_restart: { name: '服务重启', },
	...createLogFunc('数据库备份', 'devops_dbbackup'),
	devops_dbbackup_backup: { name: '数据库备份', },
	devops_dbbackup_restore: { name: '数据库恢复', },
	devops_dbbackup_upload: { name: '数据库备份上传', },
	...createLogFunc('项目备份', 'devops_pjbackup'),
	devops_pjbackup_backup: { name: '项目备份', },
	...createLogFunc('更新包', 'devops_upgrade'),
	devops_upgrade_upload: { name: '更新包上传', },
	devops_upgrade_install: { name: '更新包安装', },

	// 短信
	sms_add: { name: '发送短信验证码', },

	// 自定义接口
	customapi_run: { name: '自定义接口执行', },
}

const customConfig = loadConfig()

const warningTypeMap = {
	table_record_warning: { name: '表记录异常', },
}

// console.log('加载配置文件：', process.env)

module.exports = {
	...customConfig,
	version: packageJson.version,

	MONGO_CONNECT_URL: process.env.MONGO_CONNECT_URL,
	MONGO_NAME: process.env.MONGO_NAME || 'mongo',
	MONGO_DB_NAME: process.env.MONGO_DB_NAME || 'xinserver',
	SERVER_NAME: process.env.SERVER_NAME || packageJson.name || 'xinserver',
	SERVER_PORT: process.env.SERVER_PORT || 80,

	// 路径集合
	paths: {
		// 本地资源保存目录
		resourcePath: path.resolve(__dirname, '../../resource'),
		// docker通信
		socketPath: '/var/run/docker.sock',
		// 前端配置文件路径
		publicPath: path.resolve(__dirname, '../../public'),
		frontConfigFile: path.resolve(__dirname, '../../public/config/index.js'),
		adminConfigFile: path.resolve(__dirname, '../../data/config.json'),
	},

	// 配置信息集合
	keys: {
		qiniu_cdn_key: 'xin_system_qiniu_storage_settings', // 七牛云CDN配置
		aliyun_cdn_key: 'xin_system_aliyun_storage_settings', // 阿里云CDN配置
		wx_mp_service_key: 'xin_system_mp_service_settings', // 微信服务号配置
		server_start_time_key: 'xin_server_start_time_settings', // 微信服务号配置
		ai_deepseek_key: 'xin_systemai_deepseek_settings', // Deepseek配置
		ai_moonshot_key: 'xin_systemai_moonshot_settings', // Moonshot配置
		ai_openai_key: 'xin_systemai_openai_settings', // Openai配置
	},

	logTypeMap,
	warningTypeMap,

}
