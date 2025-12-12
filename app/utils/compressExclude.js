
// 用于解决编译后变量名为随机字符串，导致eval取值问题，此文件不混淆
function evalFunc (variableState, variableString) {
  let result
  try {
    with (variableState) {
      // console.log('---state-1---', state, variableState, variableString)
      result = eval(variableString)  // 通过 with 语句让 state 的属性可以直接访问
    }
  } catch (err) {
    console.log('--- 测试 state 问题 ---', variableState, variableString, err)
    console.error(err)
  }
  return result
}

module.exports = {
  evalFunc,
}
