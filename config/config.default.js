/* eslint valid-jsdoc: "off" */
const path = require('path')
const xinConfig = require('../app/config/')
/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = appInfo => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   **/
  const config = exports = {};

  config.proxy = xinConfig.proxy || false

  config.cors = {
    origin: Boolean(xinConfig.origin?.length) ? xinConfig.origin : '*', // 指定允许跨域的源，这里使用通配符 * 表示允许所有源
    allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH', // 指定允许的跨域请求方法
    maxAge: 3600, // 1 小时内无需重复发预检请求，提升性能
  }

  // 集群模式
  config.cluster = {
    // enable: true,
    listen: {
      // port: 7004,
      // hostname: '0.0.0.0', // 不建议设置为 '0.0.0.0'，可能导致外部连接风险，请了解后使用
    },
    workers: 1,
  }

  config.static = {
    dynamic: true, // 允许多目录配置
    gzip: true, // 开启 gzip
    buffer: false,  // 不缓存到内存
    // 配置额外的目录和前缀
    dirs: [
      {
        prefix: '/config/', // 额外目录的前缀
        dir: path.join(appInfo.baseDir, 'public/config'), // 额外的静态资源目录路径
        maxAge: 0, // 不缓存
        maxFiles: 0,
        files: null,
        buffer: false,
      },
      {
        prefix: '/', // 默认目录托管
        dir: path.join(appInfo.baseDir, 'public'),
      },
      {
        prefix: '/', // 默认目录托管
        dir: path.join(appInfo.baseDir, 'public/lib/monaco'),
      },
      {
        prefix: '/web/', // 额外目录的前缀
        dir: path.join(appInfo.baseDir, 'resource/web'), // 额外的静态资源目录路径
        maxAge: 0, // 不缓存
        maxFiles: 0,
        files: null,
        buffer: false,
      },
      {
        prefix: '/resource/', // 额外目录的前缀
        dir: path.join(appInfo.baseDir, 'resource'), // 额外的静态资源目录路径
        // maxAge: 31536000, // 缓存 1 年
      },
      // 添加更多目录配置...
    ],
  }

  config.security = {
    // 禁用默认的 X-Powered-By 头
    poweredBy: false,
    csrf: {
      enable: false,
    },
  }

  config.multipart = {
    mode: 'file',
    fileSize: '10gb',
    fileExtensions: [
      // 图片格式（含常用矢量图、图标）
      '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg', '.ico', '.webp', '.tiff', '.psd',
      // 文档格式（办公、文本、PDF）
      '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.pdf', '.txt', '.md', '.csv', '.json',
      // 压缩包格式
      '.zip', '.rar', '.7z', '.tar', '.gz', '.tgz',
      // 音视频格式
      '.mp3', '.wav', '.ogg', '.flac', '.mp4', '.avi', '.mov', '.wmv', '.mkv', '.flv',
      // 程序/代码文件（若需上传脚本、配置文件）
      '.js', '.jsx', '.ts', '.tsx', '.css', '.scss', '.less', '.html', '.vue', '.react', '.php', '.java', '.py', '.go',
      // 其他常用格式
      '.xml', '.yml', '.yaml', '.log', '.ini', '.exe', '.dmg', '.pkg', '.apk', '.ipa',
      // Xins
      '.xins', '.xin',
    ].concat(xinConfig.fileExtensions || []),
  }

  // 请求解析
  config.bodyParser = {
    enable: true,
    encoding: 'utf8',
    formLimit: '1mb',
    jsonLimit: '5mb',
    strict: true,
    // @see https://github.com/hapijs/qs/blob/master/lib/parse.js#L8 for more options
    queryString: {
      arrayLimit: 200,
      depth: 10,
      parameterLimit: 2000,
    },
    enableTypes: ['json', 'form', 'text'],
    extendTypes: {
      text: ['text/xml', 'application/xml'],
      json: [
        'application/json; charset=utf-8',
        'application/vnd.api+json', // JSON API 标准格式
        'application/json5', // JSON5 格式（支持注释、尾随逗号）
      ],
    },
  }

  config.mongoose = {
    client: {
      // url: process.env.MONGO_CONNECT_URL,
      options: {
        maxPoolSize: 20,
        ignoreUndefined: true,
        retryWrites: false,
      },
      plugins: [
      ],
    },
  }

  // add your middleware config here
  config.middleware = [
    'errorHandler',
    'getToken',
    'getProject',
    'notFoundHandler',
  ];

  config.errorHandler = {
    match: '/api',
  };

  config.getToken = {
    ignore: (ctx) => {
      const currentUrl = ctx.request.url
      const apiWhitelist = [
        '/api/core/platform/createProject',
        '/api/core/user/check_admin',
        '/api/core/user/add_admin',

        '/api/core/system/project/detail',
        '/api/core/auth/account/login',
        '/api/core/wx/account/login',

        '/api/core/server/sms/send_smscode',
        '/api/core/server/sms/check_smscode',

        // 公共接口
        '/api/core/common/noauth',
        '/api/core/common/uploadLicense',
        '',
        '',
        '',

        // 微信相关的接口
        '/api/core/server/wx/',
        // ai相关的接口
        // '/api/core/ai/',
      ].filter(Boolean)
      return apiWhitelist.some((item) => currentUrl.startsWith(item)) || !currentUrl.startsWith('/api')
    },
  }

  config.getProject = {
    ignore: (ctx) => {
      const currentUrl = ctx.request.url
      const apiWhitelist = [
        '/api/core/platform/createProject',

        '/api/core/system/project/detail',

        // 公共接口
        '/api/core/common/noauth',

        // 微信相关的接口
        '/api/core/server/wx/',
        // ai相关的接口
        // '/api/core/server/ai/',
      ].filter(Boolean)
      return apiWhitelist.some((item) => currentUrl.startsWith(item)) || !currentUrl.startsWith('/api')
    },
  }

  // use for cookie sign key, should change to your own and keep security
  config.keys = xinConfig.cookie_key || appInfo.name + '_1757484640364_4621';

  // add your user config here
  const userConfig = {
    // myAppName: 'egg',
    name: 'xinserver',
  };

  return {
    ...config,
    ...userConfig,
  };
};
