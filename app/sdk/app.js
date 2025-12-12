
/**
 * 生成随机字符串
 * @param {string} startStr 随机字符串前缀
 * @param {number} length 随机字符串长度，不包含前缀
 * @returns UUID，随机字符串
 */
function uuid (startStr = 'uid', length) {
  var str = 'yxxyxyyyxyyyxyyxyxyyxxyxyxyxyxyyyxyxyy'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0,
      v = c == 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
  return startStr + str.substring(0, length || 12)
}

/**
 * 执行自定义脚本
 * @param {string} code 自定义代码
 * @return {object} 结果
 */
function runScriptFunc (code) {
  const __name = uuid('obj_')
  code = `global.${__name} = ${code}`
  eval(code)

  const func = global[__name]
  delete global[__name]
  return func
}

module.exports = {
  uuid,
  runScriptFunc,
}