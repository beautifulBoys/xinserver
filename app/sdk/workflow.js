
const compressExclude = require('../utils/compressExclude')

// 各模块的变量输出
function startTableRecord ({ module, workflowRecordInfo, }) {
  const results = workflowRecordInfo.workflow?.results || {}
  const tableInfo = workflowRecordInfo.workflow?.tableInfo
  const recordInfo = JSON.parse(JSON.stringify(workflowRecordInfo || {}))

  return {
    name: tableInfo?.name,
    ...recordInfo,
  }
}

function tableRecordCreate ({ module, workflowRecordInfo, }) {
  const results = workflowRecordInfo.workflow?.results || {}
  // 当前节点关联的表
  const tableInfo = module?.data?.attributes?.tableInfo || {}
  const currentResult = JSON.parse(JSON.stringify(results[module.moduleId] || {}))

  return {
    name: tableInfo?.name,
    ...currentResult,
  }
}

function tableRecordSearch ({ module, workflowRecordInfo, }) {
  const results = workflowRecordInfo.workflow?.results || {}
  // 当前节点关联的表
  const tableInfo = module?.data?.attributes?.tableInfo || {}
  const currentResult = JSON.parse(JSON.stringify(results[module.moduleId] || []))

  return {
    name: tableInfo?.name,
    table_id: tableInfo?._id,
    count: currentResult?.length || 0,
    records: currentResult || [],
  }
}

function tableRecordSearchOne ({ module, workflowRecordInfo, }) {
  const results = workflowRecordInfo.workflow?.results || {}
  // 当前节点关联的表
  const tableInfo = module?.data?.attributes?.tableInfo || {}
  const currentResult = JSON.parse(JSON.stringify(results[module.moduleId] || {}))

  return {
    name: tableInfo?.name,
    ...currentResult,
  }
}

function tableRecordUpdate ({ module, workflowRecordInfo, }) {
  const results = workflowRecordInfo.workflow?.results || {}
  // 当前节点关联的表
  const tableInfo = module?.data?.attributes?.tableInfo || {}
  const currentResult = JSON.parse(JSON.stringify(results[module.moduleId] || {}))

  return {
    name: tableInfo?.name,
    table_id: tableInfo?._id,
    count: currentResult.length || 0,
    records: currentResult || [],
  }
}

function nodejs ({ module, workflowRecordInfo, }) {
  const results = workflowRecordInfo.workflow?.results || {}
  // const tableInfo = workflowRecordInfo.workflow?.tableInfo
  const currentResult = JSON.parse(JSON.stringify(results[module.moduleId] || {}))

  return {
    ...currentResult,
  }
}

function aiToText ({ module, workflowRecordInfo, }) {
  const results = workflowRecordInfo.workflow?.results || {}
  // const tableInfo = workflowRecordInfo.workflow?.tableInfo
  const currentResult = JSON.parse(JSON.stringify(results[module.moduleId] || {}))

  return {
    content: currentResult.content,
    htmlContent: currentResult.htmlContent,
    markdownContent: currentResult.markdownContent,
  }
}

function connector ({ module, workflowRecordInfo, }) {
  const results = workflowRecordInfo.workflow?.results || {}
  // const tableInfo = workflowRecordInfo.workflow?.tableInfo
  const currentResult = JSON.parse(JSON.stringify(results[module.moduleId] || {}))

  return {
    status: currentResult.status,
    result: currentResult.result,
  }
}




const workflowSdk = {
  startTableRecord,
  tableRecordCreate,
  tableRecordSearch,
  tableRecordSearchOne,
  tableRecordUpdate,
  nodejs,
  aiToText,
  connector,
}

// 获取变量集合
const getVariableState = ({ module, workflowRecordInfo, }) => {
  const customDataMap = workflowRecordInfo.workflow?.workflow_info?.body?.customDataMap || {}
  const preModuleMap = workflowRecordInfo.workflow?.workflow_info?.body?.preModuleMap || {}
  const ids = preModuleMap[module.moduleId] || []
  const states = workflowRecordInfo.workflow?.states || {}
  const state = Object.fromEntries(
    ids.reverse().map(moduleId => {
      const moduleInfo = customDataMap[moduleId]
      const func = workflowSdk[moduleInfo.moduleType]
      if (func) {
        return [
          moduleId,
          func({ module: moduleInfo, workflowRecordInfo, }),
        ]
      } else {
        return null
      }
    }).filter(Boolean)
  )
  return Object.assign(states, state)
}

// 获取变量绑定值
const getVariableValue = ({ module, workflowRecordInfo, }, value) => {
  const _variableValue = value

  if (_variableValue === null || _variableValue === undefined || !_variableValue) {
    return _variableValue
  }

  if (
    Object.prototype.toString.call(_variableValue) === '[object Object]'
    && _variableValue.type === 'variable'
    && _variableValue.variable
  ) {
    // const customDataMap = workflowRecordInfo.workflow?.workflow_info?.body?.customDataMap || {}
    // const preModuleMap = workflowRecordInfo.workflow?.workflow_info?.body?.preModuleMap || {}
    // const ids = preModuleMap[module.moduleId] || []
    // const state = Object.fromEntries(
    //   ids.reverse().map(moduleId => {
    //     const moduleInfo = customDataMap[moduleId]
    //     const func = workflowSdk[moduleInfo.moduleType]
    //     if (func) {
    //       return [
    //         moduleId,
    //         func({ module: moduleInfo, workflowRecordInfo, }),
    //       ]
    //     } else {
    //       return null
    //     }
    //   }).filter(Boolean)
    // )
    var state = getVariableState({ module, workflowRecordInfo, })
// console.log('---getValue-state---', state)
    const variableString = _variableValue.variable
    var result = compressExclude.evalFunc({ state }, variableString)

    return result
  } else {
    return _variableValue
  }
}

// 从用户选择器的数据中，获取用户ID数组
function getUserIdsByMembers ({ attributes, workflowRecordInfo, module, }) {
  let user_ids = []

  if (attributes?.memberType === 'user') {
    user_ids = attributes.members?.map(item => item._id)
  } else if (attributes?.memberType === 'field') {
    const values = workflowRecordInfo || {}
    const user_id = values[attributes.members?.value]?.value
    user_ids = [ user_id ]
  } else if (attributes?.memberType === 'variable') {
    const userInfo = getVariableValue({ module, workflowRecordInfo, }, attributes.members)
    user_ids = [ userInfo?.value ]
  } else if (attributes?.memberType === 'creator') {
    const user_id = workflowRecordInfo?.create_user_id
    user_ids = [ user_id ]
  }
  return user_ids.filter(Boolean)
}


// 创建无代码数据表流程
const createWorkflowDataFunc = (tableInfo) => {
  return new Promise(async (resolve, reject) => {
    // const data = await app.apis.table_detail({
    //   _id: table_id,
    // })
    // const tableInfo = JSON.stringify(data?.data)
    // const tableInfo = data?.data
    resolve({
      "customData": {
          "moduleId": "_root_branch_id",
          "type": "分支节点",
          "moduleType": "branch",
          "branchs": [
              [
                  {
                      "type": "流程节点",
                      "moduleType": "start",
                      "moduleId": "start_af4889aa98a9",
                      "name": "开始节点",
                      "data": {
                          "title": "开始节点"
                      }
                  },
                  {
                      "type": "触发器",
                      "moduleType": "startTableRecord",
                      "moduleId": "startTableRecord_8b786bb858a8",
                      "name": "表记录事件",
                      "data": {
                          "title": "表记录事件",
                          "attributes": {
                              "timing": "add",
                              "tableInfo": tableInfo,
                              "workflow_type": "table_record_add"
                          }
                      }
                  },
                  {
                      "type": "流程节点",
                      "moduleType": "end",
                      "moduleId": "end_9b4b3aa81989",
                      "name": "结束节点",
                      "data": {
                          "title": "结束节点"
                      }
                  }
              ]
          ]
      },
      "sequenceFlowList": [
          {
              "sourceRef": "start_af4889aa98a9",
              "targetRef": "startTableRecord_8b786bb858a8"
          },
          {
              "sourceRef": "startTableRecord_8b786bb858a8",
              "targetRef": "end_9b4b3aa81989"
          }
      ],
      "startEvent": {
          "id": "start_af4889aa98a9",
          "name": "开始"
      },
      "endEvent": {
          "id": "end_9b4b3aa81989",
          "name": "结束"
      },
      "customDataMap": {
          "start_af4889aa98a9": {
              "type": "流程节点",
              "moduleType": "start",
              "moduleId": "start_af4889aa98a9",
              "name": "开始节点",
              "data": {
                  "title": "开始节点"
              }
          },
          "startTableRecord_8b786bb858a8": {
              "type": "触发器",
              "moduleType": "startTableRecord",
              "moduleId": "startTableRecord_8b786bb858a8",
              "name": "表记录事件",
              "data": {
                  "title": "表记录事件",
                  "attributes": {
                      "timing": "add",
                      "tableInfo": tableInfo,
                      "workflow_type": "table_record_add"
                  }
              }
          },
          "end_9b4b3aa81989": {
              "type": "流程节点",
              "moduleType": "end",
              "moduleId": "end_9b4b3aa81989",
              "name": "结束节点",
              "data": {
                  "title": "结束节点"
              }
          }
      },
      "preModuleMap": {
          "start_af4889aa98a9": [],
          "startTableRecord_8b786bb858a8": [
              "start_af4889aa98a9"
          ],
          "end_9b4b3aa81989": [
              "startTableRecord_8b786bb858a8",
              "start_af4889aa98a9"
          ]
      }
    })
  })
}

module.exports = {
  ...workflowSdk,

  // 获取变量值
  getVariableValue,
  // 获取变量集合
  getVariableState,
  // 获取用户绑定的用户IDs
  getUserIdsByMembers,
  // nocode 中创建默认流程
  createWorkflowDataFunc,
}