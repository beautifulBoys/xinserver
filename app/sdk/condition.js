
const appSdk = require('../sdk/app')
const workflowSdk = require('./workflow')
const fs = require('fs')
const path = require('path')
const nodetools = require('@xinserver/tools/lib/node')
const axios = require('axios')
const lodash = require('lodash')
const XinQueue = require('../../xin/xinQueue')

const queue = new XinQueue({ limit: 2, })

// 可以使用包含条件的字段类型
const includesModuleTypes = [
  'checkbox',
  'multipleSelect',
  'cascader',
]

const createScriptContexts = function (app) {
  return {
    fs,
    path,
    dayjs: app.dayjs.tz,
    axios,
    lodash,
    nodetools,
    queue,
  }
}

// 将sort对象转换好
function createSortFunc (sort) {
  sort = sort || {}
  return Object.fromEntries(Object.keys(sort).map(key => [
    [ 'create_time', '_id', ].includes(key) ? key : key,
    sort[key],
  ]))
}

// 将rules转换为比较字符串语句
function createConditionStringFunc (rules) {
  return new Promise(async (resolve, reject) => {
    const results = []
    for (let i = 0; i < rules.length; i++) {
      const andList = rules[i]
      const andResults = []
      for (let j = 0; j < andList.length; j++) {
        const item = andList[j]
        // 取得计算、预设等值
        let value = item.value?.value
        if ([ 'preset', 'code' ].includes(item.valueType)) {
          const scriptObj = appSdk.runScriptFunc(item.value?.code)
          value = await scriptObj.main({
            dayjs: this.app.dayjs.tz,
          }, undefined)
        }
        // 字段名
        let fieldValue = item.field.value
        const moduleType = fieldValue?.split('_')[0]

        // 不同模块要单独处理下
        if (moduleType === 'relation') {
          value = value?.value
          fieldValue = fieldValue + '.value'
        }
        
        value = value && JSON.stringify(value)

        // 生成当前条件
        let result = `(${fieldValue} ${item.symbol.symbol} ${value} || false)`
        if (item.symbol.value === '$includes') {
          if (conditionSdk.includesModuleTypes.includes(moduleType)) {
            result = `(${fieldValue}?.includes(${value}) || false)`
          } else {
            result = `(${fieldValue}?.indexOf(${value}) > -1 || false)`
          }
        } else if (item.symbol.value === '$notincludes') {
          if (conditionSdk.includesModuleTypes.includes(moduleType)) {
            result = `(!${fieldValue}?.includes(${value}) || false)`
          } else {
            result = `(${fieldValue}?.indexOf(${value}) === -1 || false)`
          }
        } else if (item.symbol.value === '$in') {
          result = `(${value}.includes(${fieldValue}) || false)`
        } else if (item.symbol.value === '$nin') {
          result = `(!${value}.includes(${fieldValue}) || false)`
        }
        andResults.push(result)
      }
      results.push(`(${ andResults.join(' && ') })`)
    }
    resolve( results.join(' || ') )
  })
}

// 将rules转换为搜索条件语句
async function createSearchConditionFunc (rules, { module, workflowRecordInfo, }) {
  // 将andItem条件转换为语句
  async function createAndItemFunc (andItem) {
    let value = andItem.value?.value
    if ([ 'code', 'preset' ].includes(andItem.value?.type)) {
      const scriptObj = appSdk.runScriptFunc(andItem.value?.code)
      const scriptContexts = createScriptContexts()
      value = await scriptObj.main({
        ...scriptContexts,
      }, undefined)
    }
    if (value?.type === 'variable' && value?.variable && module && workflowRecordInfo) {
      value = workflowSdk.getVariableValue({ module, workflowRecordInfo, }, value)
    }

    const moduleType = andItem.field.value?.split('_')[0]
    if (andItem.symbol?.value === '$includes') {
      if (includesModuleTypes.includes(moduleType)) {
        return value
      } else {
        return { $regex: new RegExp(value) }
      }
    } else if (andItem.symbol?.value === '$notincludes') {
      if (includesModuleTypes.includes(moduleType)) {
        return { $ne: value }
      } else {
        return { $notregex: { $regex: new RegExp(value) } }
      }
    } else {
      if (andItem.value?.type === 'code' && andItem.value?.range) {
        // 在区间内
        return { $gte: value[0], $lt: value[1] }
      } else {
        if ([ '_id', ].includes(andItem.field?.value)) {
          return value
        } else {
          return { [andItem.symbol?.value]: value }
        }
      }
    }
  }

  return {
    $or: await rules?.asyncmap(async (andList) => ({
      $and: await andList?.asyncmap(async (item) => ({
        [ [ 'create_time', '_id', ].includes(item.field?.value) ? item.field?.value : `${item.field?.value}`]: await createAndItemFunc(item),
      })),
    }))
  }
}

module.exports = {
  includesModuleTypes,

  createSortFunc,
  createConditionStringFunc,
  createSearchConditionFunc,

  createScriptContexts,
}