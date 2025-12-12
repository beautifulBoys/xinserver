
const fs = require('fs')
const path = require('path')
const CryptoJS = require('crypto-js')
const nodetools = require('@xinserver/tools/lib/node')

class XinApp {
  constructor (app) {
    this.app = app
    this.init()
  }

  init () {
  }

  // 生成n位数字字符串
  uuid (startStr = 'uid', length) {
    var str = 'yxxyxyyyxyyyxyyxyxyyxxyxyxyxyxyyyxyxyy'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0,
        v = c == 'x' ? r : (r & 0x3 | 0x8)
      return v.toString(16)
    })
    return startStr + str.substring(0, length || 12)
  }

  // 运行自定义脚本
  runScriptFunc (code) {
    const __name = uuid('obj_')
    code = `global.${__name} = ${code}`
    eval(code)

    const func = global[__name]
    delete global[__name]
    return func
  }

  // 计算授权状态
  _licenseStatus (licenseRes) {
    const license_string = licenseRes?.license_string
    const licenseInfo = licenseRes?.licenseInfo
    const noauth = this.app.xinConfig.noauth || false
    // 服务器机器码
    const machineId = nodetools.getMachineId()
    let license_status = 'ok'
    if (licenseInfo) {
      if (licenseInfo.type !== 'noauth' && !noauth) {
        if (licenseInfo.expire_time > Date.now()) { // 授权期，正常使用
          if (machineId === licenseInfo.machineId) {
            license_status = 'ok'
          } else {
            license_status = 'license_error'
          }
        } else {
          license_status = 'license_expired'
        }
      }
    } else {
      if (!noauth) {
        license_status = 'license_empty'
      }
    }
    return license_status
  }

  // 过滤参数中的空值
  _emptyValueFilters (query) {
    return Object.entries(query).reduce((acc, [key, value]) => {
      if (![ undefined, '', ].includes(value)) {
        acc[key] = value
      }
      return acc
    }, {})
  }
  // 将Mongo过滤条件里面的字段转为合适的格式
  _mongoFilterCreate (query) {
    query = this._emptyValueFilters(query)

    function parseValue(value) {
      // 已是 ObjectId 实例的跳过
      if (value && value._bsontype === 'ObjectId') {
        return value
      }

      if ([ undefined, '' ].includes(value)) return value

      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        return value
      }

      // 数组递归处理
      if (Array.isArray(value)) {
        return value.map(v => parseValue(v))
      }

      if (typeof value === 'object') {
        // ObjectId 处理
        if ('$oid' in value) {
          try {
            return this.ObjectId(value['$oid'])
          } catch {
            return undefined
          }
        }

        const result = {}
        for (const [k, v] of Object.entries(value)) {
          // 白名单操作符（只允许这些）
          const allowedOps = [
            '$eq', '$ne', '$gt', '$gte', '$lt', '$lte',
            '$in', '$nin', '$regex', '$options', '$exists', '$size', '$all', '$elemMatch',
            '$and', '$or', '$nor', '$not'
          ]

          // 非法操作符过滤
          if (k.startsWith('$') && !allowedOps.includes(k)) {
            // `忽略非法操作符: ${k}`
            continue
          }

          // 逻辑操作符处理（$or/$and/$nor）
          if (['$or', '$and', '$nor'].includes(k)) {
            if (Array.isArray(v)) {
              result[k] = v.map(item => parseValue(item))
            } else {
              // `${k} 必须是数组，已忽略`
            }
            continue
          }

          // $not 特殊处理（$not 可以包裹正则或对象）
          if (k === '$not') {
            result[k] = parseValue(v)
            continue
          }

          // 正则处理
          if (k === '$regex') {
            try {
              result['$regex'] = new RegExp(v, value['$options'] || '')
              continue
            } catch {
              // console.log('--走到这里了2--', k, v, result)
              // result['$regex'] = v
              continue
            }
          }
          if (k === '$options') {
            // 已在 $regex 分支里使用过 $options，此处去掉
            continue
          }

          // ObjectId 嵌套
          if (k === '$oid') {
            try {
              result[k] = this.ObjectId(v)
            } catch {
              result[k] = undefined
            }
            continue
          }

          // 普通字段递归
          result[k] = parseValue(v)
        }

        return result
      }

      return value
    }

    const filter = {}
    for (const [key, value] of Object.entries(query)) {
      filter[key] = parseValue(value)
    }

    return filter
  }

  ObjectId (...args) {
    return new this.app.mongoose.Types.ObjectId(...args)
  }

  // 读取目录内内容
  readdir (fullpath) {
    return new Promise((resolve, reject) => {
      fs.readdir(fullpath, (err, data) => {
        if (err) {
          console.error('读取目录出错', err)
          resolve([])
        } else {
          resolve(data)
        }
      })
    })
  }

  // 读取文件或目录状态
  stat (fullpath) {
    return new Promise((resolve, reject) => {
      fs.stat(fullpath, (err, stats) => {
        if (err) {
          console.error('读取stat出错', err)
          resolve()
        } else {
          resolve(stats)
        }
      })
    })
  }

  // 读取目录及文件为树形结构
  readDirToTree (fullpath, options) {
    return new Promise(async (resolve, reject) => {
      const fileNames = await this.readdir(fullpath)
      const list = []
      for (let i = 0; i < fileNames.length; i++) {
        const fileName = fileNames[i]
        const filePath = (fullpath + '/' + fileName).replace('//', '/')
  
        const stats = await this.stat(filePath)
        if (stats.isDirectory() && options.dir) {
          const children = await this.readDirToTree(filePath, options)
          list.push({
            type: 'dir',
            name: fileName,
            path: filePath.slice(filePath.indexOf(options.startPath)),
            size: stats.size,
            create_time: this.app.dayjs.tz(stats.birthtime).valueOf(),
            children: options.loop ? children : [],
          })
        } else if (stats.isFile() && options.file) {
          list.push({
            type: 'file',
            name: fileName,
            path: filePath.slice(filePath.indexOf(options.startPath)),
            size: stats.size,
            create_time: this.app.dayjs.tz(stats.birthtime).valueOf(),
          })
        }
      }
      resolve(list)
    })
  }

  // 递归创建目录，安全
  mkdir (fullpath) {
    return new Promise(async (resolve, reject) => {
      fs.mkdir(fullpath, { recursive: true }, (err) => {
        if (err) {
          console.error('-------创建目录失败', err, fullpath)
          resolve()
        } else {
          console.log('目录创建成功')
          resolve(true)
        }
      })
    })
  }

  // 删除文件，安全
  unlink (fullpath) {
    return new Promise(async (resolve, reject) => {
      fs.unlink(fullpath, (err) => {
        if (err) {
          console.error('-------删除文件失败', err, fullpath)
          resolve()
        } else {
          console.log('删除文件成功')
          resolve(true)
        }
      })
    })
  }

}

// /**
//  * 生成随机字符串
//  * @param {string} startStr 随机字符串前缀
//  * @param {number} length 随机字符串长度，不包含前缀
//  * @returns UUID，随机字符串
//  */
// function uuid (startStr = 'uid', length) {
//   var str = 'yxxyxyyyxyyyxyyxyxyyxxyxyxyxyxyyyxyxyy'.replace(/[xy]/g, function (c) {
//     var r = Math.random() * 16 | 0,
//       v = c == 'x' ? r : (r & 0x3 | 0x8)
//     return v.toString(16)
//   })
//   return startStr + str.substring(0, length || 12)
// }

// /**
//  * 执行自定义脚本
//  * @param {string} code 自定义代码
//  * @return {object} 结果
//  */
// function runScriptFunc (code) {
//   const __name = uuid('obj_')
//   code = `global.${__name} = ${code}`
//   eval(code)

//   const func = global[__name]
//   delete global[__name]
//   return func
// }

module.exports = XinApp