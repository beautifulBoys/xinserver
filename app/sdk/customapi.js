const appSdk = require('./app')
const axios = require('axios')
const lodash = require('lodash')

const ERROR_MESSAGE = '服务开小差啦~'

const requestFunc = ({
  url = '',
  method = 'POST',
  headers = {},
  data = {},
  serverURL = 'http://127.0.0.1:7004',
  token,
  project_id,

}) => {
  return new Promise((resolve, reject) => {
    axios.request({
      baseURL: serverURL || '',
      url,
      method,
      headers: {
        ...(headers || {}),
        'xins-token': token,
        'xins-project': project_id,
      },
      params: method === 'GET' ? data : null,
      data: method === 'POST' ? data : null,
    }).then((res) => {
      if (res.status === 200) {
        if (res.data?.errCode === 0) {
          resolve(res.data || {})
        } else {
          if ([ 101, 102, 103, 104, 105, ].includes(res.data?.errCode)) { // token不存在
            console.error(res.data)
            reject(res)
          }
          resolve(res.data || {})
        }
      } else {
        reject(res)
      }
    }).catch(err => {
      console.error(err)
      reject(err)
    })
  })
}


const createScriptContexts = function () {
  return {
    dayjs: this.app.dayjs.tz,
    axios,
    lodash,
  }
}

const createXrequest = function (system_options) {
  return {
    get: (url, data, options) => {
      return requestFunc({
        method: 'GET',
        url,
        data: data || {},
        ...(options || {}),
        ...(system_options || {}),
      })
    },
    post: (url, data, options) => {
      return requestFunc({
        method: 'POST',
        url,
        data: data || {},
        ...(options || {}),
        ...(system_options || {}),
      })
    },
  }
}



module.exports = {
  createScriptContexts,
  createXrequest,
}