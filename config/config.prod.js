/* eslint valid-jsdoc: "off" */

'use strict';

/**
 * @param {Egg.EggAppInfo} appInfo app info
 */

const path = require('path')
const numCPUs = require('os').cpus().length

module.exports = appInfo => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   **/
  const config = exports = {};

  // 集群模式
  config.cluster = {
    listen: {
      hostname: process.env.SERVER_HOSTNAME || '0.0.0.0', // 不建议设置为 '0.0.0.0'，可能导致外部连接风险，请了解后使用
    },
  }

  config.mongoose = {
    client: {
      url: process.env.MONGO_CONNECT_URL || 'mongodb://xin_admin:vYKPYXdt9Bfg@mongo:27017/xinadmin?authSource=admin&replicaSet=rs0&directConnection=true',
    },
  }
  console.log('[egg-mongo] 连接地址：' + config.mongoose.client.url)

  // config.redis = {
  //   client: {
  //     port: 6379,          // Redis port
  //     host: '127.0.0.1',   // Redis host
  //     password: 'auth',
  //     db: 0,
  //   },
  // }

  config.logger = {
    // disableConsoleAfterReady: true, // ✅ 必须为 false，Egg 默认是 true（生产禁 console）
    level: 'INFO',
    consoleLevel: 'TRACE',  // ✅ 推荐生产禁用 console
    outputJSON: false,
    dir: path.join(appInfo.baseDir, 'logs'), // ✅ 和你 Docker 映射一致
    // dir: '/app/logs', // ✅ 和你 Docker 映射一致
    disableConsole: false, // 不禁用控制台输出（默认 false，保险起见显式声明）
  }
  config.console = {
    level: 'TRACE', // 最低级别，输出所有日志（TRACE < DEBUG < INFO < WARN < ERROR）
    disableConsoleAfterReady: false, // ✅ 关键：禁用 Egg 启动后关闭原生 console 的默认行为
  }

  // add your user config here
  const userConfig = {
  };

  return {
    ...config,
    ...userConfig,
  };
};
