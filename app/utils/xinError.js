
module.exports = {
  forceSuccess: (data) => {
    return data
  },

  // 鉴权相关
  tokenParseError: (data) => {
    return { errCode: 101, errMsg: 'Token解析错误', data }
  },
  tokenNotExistError: (data) => {
    return { errCode: 102, errMsg: 'Token不存在', data }
  },
  tokenExpiredError: (data) => {
    return { errCode: 103, errMsg: 'Token已过期', data }
  },
  tokenNoPermissionError: (data) => {
    return { errCode: 104, errMsg: '账号无权限', data }
  },
  tokenInvalidError: (data) => {
    return { errCode: 105, errMsg: 'Token已失效', data }
  },

  // 用户相关
  userinfoError: (data) => {
    return { errCode: 201, errMsg: '用户信息异常', data }
  },
  // usernameExistError: (data) => {
  //   return { errCode: 202, errMsg: '用户名已存在', data }
  // },
  userNotExistError: (data) => {
    return { errCode: 203, errMsg: '用户不存在', data }
  },
  userPasswordError: (data) => {
    return { errCode: 204, errMsg: '密码不正确', data }
  },
  userStateError: (data) => {
    return { errCode: 205, errMsg: '用户状态异常', data }
  },
  userExistError: (data) => { // 注册账号时候使用
    return { errCode: 206, errMsg: '用户已存在', data }
  },

  // 项目相关
  projectNotExistError: (data) => {
    return { errCode: 240, errMsg: '项目状态异常', data }
  },

  // 平台
  loginTypeError: (data) => {
    return { errCode: 250, errMsg: '登录方式不正确', data }
  },

  // 其它
  success: (data, errMsg) => {
    if (data && typeof data === 'object' && !Array.isArray(data) && Object.prototype.hasOwnProperty.call(data, 'errCode')) {
      return data
    } else {
      return { errCode: 0, errMsg: errMsg || '请求成功', data }
    }
  },
	basicError: (data, errMsg) => {
    return { errCode: 400, errMsg: errMsg || '服务开小差啦！', data }
	},
	notCompleteError: (data, errMsg) => {
    return { errCode: 402, errMsg: errMsg || '接口暂未完成', data }
	},
	notFoundError: (data, errMsg) => {
    return { errCode: 404, errMsg: errMsg || '接口不存在', data }
	},
}

