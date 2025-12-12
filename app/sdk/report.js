
const conditionSdk = require('./condition')

async function huizong_createSearchOptionFunc (moduleInfo, options = {}) {
  const table_id = moduleInfo.data?.attributes?.tableInfo?._id
  const table_filter = moduleInfo.data?.attributes?.filters || []
  const table_rows = moduleInfo.data?.attributes?.rows || []
  const table_columns = moduleInfo.data?.attributes?.columns || []
  const table_targets = moduleInfo.data?.attributes?.targets || []
  const table_sorts = moduleInfo.data?.attributes?.sorts || []

  const matchs = await conditionSdk.createSearchConditionFunc(table_filter, {})

  const allMatchs = {
    $and: [
      matchs.$or?.length && matchs,
      options?.customMatchs?.$or?.length && options.customMatchs,
    ].filter(Boolean),
  }

  return {
    collection: 'XinTableRecord',
    table_id,
    match: {
      ...(allMatchs.$and.length ? allMatchs : {}),
    },
    aggregate: [
      {
        $group: {
          _id: {
            ...Object.fromEntries(table_rows.map(item => [ item.moduleId, `$${item.moduleId}` ])),
            ...Object.fromEntries(table_columns.map(item => [ item.moduleId, `$${item.moduleId}` ])),
          },
          ...Object.fromEntries(table_targets.map(item => [ item.fieldInfo?.moduleId, item.symbol === 'count' ? { '$sum': 1 } : { [ '$' + item.symbol ]: `$${item.fieldInfo?.moduleId}` } ])),
        },
      },
      {
        $project: {
          _id: 0,
          ...Object.fromEntries(table_rows.map(item => [ item.moduleId, `$_id.${item.moduleId}` ])),
          ...Object.fromEntries(table_columns.map(item => [ item.moduleId, `$_id.${item.moduleId}` ])),
          ...Object.fromEntries(table_targets.map(item => [ item.fieldInfo?.moduleId, 1 ])),
        },
      },
      table_sorts.length && {
        $sort: {
          ...Object.fromEntries(table_sorts.map(item => [
            item.fieldInfo?.moduleId, item.symbol === 'asc' ? 1 : -1
          ])),
        },
      },
    ].filter(Boolean),
  }
}

async function mingxi_createSearchOptionFunc (moduleInfo, options = {}) {
  const table_id = moduleInfo.data?.attributes?.tableInfo?._id
  const table_filter = moduleInfo.data?.attributes?.filters || []
  const table_rows = moduleInfo.data?.attributes?.rows || []
  const table_columns = moduleInfo.data?.attributes?.columns || []
  const table_targets = moduleInfo.data?.attributes?.targets || []
  const table_sorts = moduleInfo.data?.attributes?.sorts || []

  const matchs = await conditionSdk.createSearchConditionFunc(table_filter, {})

  const allMatchs = {
    $and: [
      matchs.$or?.length && matchs,
      options?.customMatchs?.$or?.length && options.customMatchs,
    ].filter(Boolean),
  }

  return {
    collection: 'XinTableRecord',
    function: 'find',
    params: [
      {
        table_id,
        ...(allMatchs.$and.length ? allMatchs : {}),
      },
    ],
    select: Object.fromEntries(table_columns.map(item => [ item.moduleId, 1 ])),
    populate: [
    ],
    sort: {
      ...Object.fromEntries(table_sorts.map(item => [
        item.fieldInfo?.moduleId,
        item.symbol === 'asc' ? 1 : -1,
      ])),
    },
  }
}


module.exports = {
  huizong: {
    createSearchOption: huizong_createSearchOptionFunc,
  },
  mingxi: {
    createSearchOption: mingxi_createSearchOptionFunc,
  },
}