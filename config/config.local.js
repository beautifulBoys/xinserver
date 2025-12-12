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
      hostname: '0.0.0.0', // 不建议设置为 '0.0.0.0'，可能导致外部连接风险，请了解后使用
    },
  }

  config.mongoose = {
    client: {
      // url: 'mongodb://xin_admin:vYKPYXdt9Bfg@localhost:27018/xinadmin?authSource=admin&replicaSet=rs0&directConnection=true', // 本机 Docker Mongo
      url: 'mongodb://xin_admin:FvxP21ily0IHmcf1Booh@101.201.37.232:27017/xinserver?authSource=admin&replicaSet=rs0&directConnection=true', // 101.201.37.232 服务器
      // url: 'mongodb://xin_admin:wlPO8G2PopoK@47.104.177.11:27019/xinserver?authSource=admin&replicaSet=rs0&directConnection=true', // 47.104.177.11 服务器
    },
  }

  // config.redis = {
  //   client: {
  //     port: 6379,          // Redis port
  //     host: '127.0.0.1',   // Redis host
  //     password: 'auth',
  //     db: 0,
  //   },
  // }

  // add your user config here
  const userConfig = {
  };

  return {
    ...config,
    ...userConfig,
  };
};
