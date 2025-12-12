

const mongoose = require('mongoose')
const fs = require('fs')
const path = require('path')

/*
  分析数据结构
    ObjectId - 唯一ID
    Number - InputNumber
    String - Input，Textarea
    Boolean - Switch
    Mixed - JSON
    Array - 


*/

// 模型公用函数 - 开始
function createCommonOptions (CONFIG) {
  return {
    versionKey: false,
    id: false,
    tableName: CONFIG.tableName,
    collection: CONFIG.modelName,
    ispublic: CONFIG.ispublic,
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  }
}

function createCommonBeforeFields (CONFIG) {
  return {}
}

function createCommonAfterFields (CONFIG) {
  return {
    create_user_id: {
      title: '创建用户ID',
      type: mongoose.Schema.Types.ObjectId,
    },
    comment: {
      title: '备注',
      type: String,
      trim: true,
    },
    status: {
      title: '逻辑状态',
      type: Boolean,
      default: true,
    },
    create_time: {
      title: '创建时间',
      type: Number,
      default: Date.now,
    },
    update_time: {
      title: '更新时间',
      type: Number,
      default: Date.now,
    },
  }
}

function createCommonIndexs (CONFIG, Schema) {
  // Schema.index({ create_user_id: 1, })
  // Schema.index({ create_time: -1 })
  Schema.index({ status: 1, create_user_id: 1, create_time: -1 })
}

function createCommonVirtuals (CONFIG, Schema) {
  Schema.virtual('createUserInfo', {
    ref: 'xin_user',
    localField: 'create_user_id',
    foreignField: '_id',
    justOne: true,
  })
}

function createEnumAttributes (list) {
  return {
    enum: list.map(item => item.value ?? item.label),
    enum_desc: list.map(item => `${item.value ?? item.label}: ${item.label}`).join('，'),
  }
}

// 模型公用函数 - 结束



// 模型构建函数 - 开始
function commonSchemaFunc (module, attrs) {
  const fieldname = module?.data?.attributes?.fieldname || module.moduleId
  const defaultValue = module?.data?.attributes?.defaultValue || undefined

  return [
    fieldname,
    {
      title: module?.data?.attributes?.title || module?.name,
      unique: Boolean(module?.data?.attributes?.unique),
      default: defaultValue,
      ...(attrs || {}),
    }
  ]
}

function objectIdSchema (module) {
  return commonSchemaFunc(module, {
    type: mongoose.Schema.Types.ObjectId,
  })
}

function inputSchema (module) {
  return commonSchemaFunc(module, {
    type: String,
    trim: Boolean(module?.data?.attributes?.trim),
  })
}

function inputNumberSchema (module) {
  return commonSchemaFunc(module, {
    type: Number,
  })
}

function selectSchema (module) {
  return commonSchemaFunc(module, {
    type: mongoose.Schema.Types.ObjectId,
  })
}

function selectVirtual (module) {
  const fieldname = module?.data?.attributes?.fieldname || module.moduleId
  const newfieldname = `${fieldname}Info`
  return {
    name: newfieldname,
    ref: 'xin_dictionary',
    localField: fieldname,
    foreignField: '_id',
    count: false,
    justOne: true,
    populate: {
      path: newfieldname,
      select: '_id name color',
      match: {},
    },
  }
}

function multipleSelectSchema (module) {
  return commonSchemaFunc(module, {
    type: [mongoose.Schema.Types.ObjectId],
  })
}

function multipleSelectVirtual (module) {
  const fieldname = module?.data?.attributes?.fieldname || module.moduleId
  const newfieldname = `${fieldname}Infos`
  return {
    name: newfieldname,
    ref: 'xin_dictionary',
    localField: fieldname,
    foreignField: '_id',
    count: false,
    justOne: false,
    populate: {
      path: newfieldname,
      select: '_id name color',
      match: {},
    },
  }
}

function dateRangePickerSchema (module) {
  return commonSchemaFunc(module, {
    type: [Number],
  })
}

function switchSchema (module) {
  return commonSchemaFunc(module, {
    type: Boolean,
  })
}

function jsonSchema (module) {
  return commonSchemaFunc(module, {
    type: mongoose.Schema.Types.Mixed,
  })
}

function relationSchema (module) {
  return commonSchemaFunc(module, {
    type: mongoose.Schema.Types.ObjectId,
  })
}

function organizationVirtual (module) {
  const fieldname = module?.data?.attributes?.fieldname || module.moduleId
  const newfieldname = `${fieldname}Info`
  return {
    name: newfieldname,
    ref: 'xin_organization',
    localField: fieldname,
    foreignField: '_id',
    count: false,
    justOne: true,
    populate: {
      path: newfieldname,
      select: '_id name',
      match: {},
    },
  }
}

function userVirtual (module) {
  const fieldname = module?.data?.attributes?.fieldname || module.moduleId
  const newfieldname = `${fieldname}Infos`
  return {
    name: newfieldname,
    ref: 'xin_user',
    localField: fieldname,
    foreignField: '_id',
    count: false,
    justOne: false,
    populate: {
      path: newfieldname,
      select: '_id name avatar',
      match: {},
    },
  }
}

function relationVirtual (module) {
  const fieldname = module?.data?.attributes?.fieldname || module.moduleId
  const ref = module?.data?.attributes?.table_id
  const foreignField = module?.data?.attributes?.value_field
  const newfieldname = `${fieldname}Info`
  // console.log('---relationVirtual---', fieldname, ref, newfieldname ,module?.data?.attributes)
  return {
    name: newfieldname,
    ref: ref,
    localField: fieldname,
    foreignField: foreignField,
    count: false,
    justOne: true,
    populate: {
      path: newfieldname,
      // select: '_id table_id values',
      match: {},
    },
  }
}
// 模型构建函数 - 结束

const moduleMap = {
  objectId: {
    schema: objectIdSchema,
  },
  inputNumber: {
    schema: inputNumberSchema,
  },
  input: {
    schema: inputSchema,
  },
  textarea: {
    schema: inputSchema,
  },
  radio: {
    schema: selectSchema,
    virtual: selectVirtual,
  },
  checkbox: {
    schema: multipleSelectSchema,
    virtual: multipleSelectVirtual,
  },
  select: {
    schema: selectSchema,
    virtual: selectVirtual,
  },
  multipleSelect: {
    schema: multipleSelectSchema,
    virtual: multipleSelectVirtual,
  },
  datePicker: {
    schema: inputNumberSchema,
  },
  dateRangePicker: {
    schema: dateRangePickerSchema,
  },
  switch: {
    schema: switchSchema,
  },
  email: {
    schema: inputSchema,
  },
  mobile: {
    schema: inputSchema,
  },
  fileUpload: {
    schema: jsonSchema,
  },
  imageUpload: {
    schema: jsonSchema,
  },
  json: {
    schema: jsonSchema,
  },
  organizationSelect: {
    schema: selectSchema,
    virtual: organizationVirtual,
  },
  rate: {
    schema: inputNumberSchema,
  },
  slider: {
    schema: inputNumberSchema,
  },
  url: {
    schema: inputSchema,
  },
  richText: {
    schema: inputSchema,
  },
  userSelect: {
    // schema: selectSchema,
    // virtual: userVirtual,
    schema: multipleSelectSchema,
    virtual: userVirtual,
  },
  relation: {
    schema: relationSchema,
    virtual: relationVirtual,
  },
  
}

class XinMongo {
  constructor (app) {
    this.app = app
    this.ctx = app.createAnonymousContext()
    this.ons = {}
    app.models = this.models = {}
    this.listener()
  }

  get modelList () {
    return Object.values(this.models)
  }

  on (key, fn) {
    this.ons[key] = fn
  }

  listener () {
    // 数据库初始化完成
    this.app.mongoose.connection.once('open', async () => {
      // console.log('[egg-mongoose] MongoDB 连接成功 ✅')
      await this.init()
      // await new Promise((res) => setTimeout(res, 6000))
      this.ons['open']?.()
    })
    // 通信机制，刷新mongo模型
    this.app.messenger.on('refreshMongoModel', async ({ table_id }) => {
      // console.log('-----进程收到消息---', table_id, process.pid)
      await this.restore(table_id)
    })

  }

  async init () {
    // 初始化系统表
    const modelsDir = path.join(this.app.baseDir, 'app/models')
    fs.readdirSync(modelsDir).forEach(file => {
      if (file.endsWith('.js')) {
        const createFunc = require(path.join(modelsDir, file))
        this.inset_table_model(createFunc)
      }
    })
    // 初始化自定义表
    const tables = await this.getTableList()
    tables.forEach(tableInfo => {
      this.custom_table_model(tableInfo)
    })

    // console.log('[xin-mongo] 初始化成功', this.models)
    console.log('[xin-mongo] 初始化成功 ✅')
    // console.log('[xin-mongo] 初始化成功',this.models)
  }

  // 虚拟化
  virtualFunc (Schema, item) {
    // console.log('---virtualFunc---', item)
    if (item.name && item.ref && item.localField && item.foreignField) {
      Schema.virtual(item.name, {
        ref: item.ref,
        localField: item.localField,
        foreignField: item.foreignField,
        count: Boolean(item.count),
        justOne: Boolean(item.justOne),
        // match: { status: !item.justOne, },
      })
    }
  }

  async get (table_id) {
    table_id = table_id.toString()
    if (mongoose.models?.[table_id]) {
      return this.models[table_id]
    }
    if (this.models[table_id]) {
      return this.models[table_id]
    }
    const tableInfo = await this.getTable(table_id)
    const result = this.custom_table_model(tableInfo)
    console.log(`【进程：${process.pid}】 Model ${table_id} 构建成功`, Date.now())
    return result
  }

  async restore (table_id) {
    table_id = table_id.toString()
    const tableInfo = await this.getTable(table_id)
    this.destroy(table_id)
    if (tableInfo) {
      const result = this.custom_table_model(tableInfo)
      console.log(`【进程：${process.pid}】 Model ${table_id} ReStore 成功`, Date.now())
      return result
    } else {
      return
    }
  }

  async getTable (table_id) {
    const tableInfo = await this.app.models.xin_table.Model
                                  .findOne({
                                    _id: table_id,
                                  })
                                  .select({
                                    tablename: 1,
                                    fields: 1,
                                  })
                                  .populate([
                                    // { path: 'indexs', match: { status: true, }, },
                                    { path: 'virtuals', match: { status: true, }, },
                                  ])
                                  .lean()
                                  .exec()
    return tableInfo
  }

  async getTableList () {
    const tableList = await this.app.models.xin_table.Model
                                  .find({
                                    status: true,
                                  })
                                  .select({
                                    tablename: 1,
                                    fields: 1,
                                  })
                                  .populate([
                                    // { path: 'indexs', match: { status: true, }, },
                                    { path: 'virtuals', match: { status: true, }, },
                                  ])
                                  .lean()
                                  .exec()
    return tableList
  }

  // 自定义表模型化
  custom_table_model (tableInfo) {
    const table_id = tableInfo?._id?.toString()
    const tablename = tableInfo?.tablename
    const fields = tableInfo?.fields || []
    const virtuals = tableInfo?.virtuals || []
    // 自定义字段的虚拟字段
    const fieldVirtuals = fields.map(
      item => (moduleMap[item.moduleType] || moduleMap.input).virtual?.(item)
    ).filter(Boolean)
    // 自定义虚拟字段
    const customVirtuals = virtuals.map(
      item => ({ path: item.name, })
    ).filter(Boolean)

    // 自定义字段定义
    const values = Object.fromEntries(
      fields.map(
        item => (moduleMap[item.moduleType] || moduleMap.input).schema?.(item)
      ).filter(Boolean)
    )

    // console.log('-----fieldVirtuals', JSON.stringify(fieldVirtuals, null, 2))

    const RecordSchema = new mongoose.Schema({
      ...(createCommonBeforeFields(tablename) || {}),
      // table_id: {
      //   title: '数据表ID',
      //   type: mongoose.Schema.Types.ObjectId,
      // },
      ...values,

      ...(createCommonAfterFields(tablename) || {}),
    }, {
      ...(createCommonOptions(tablename) || {}),
      collection: tablename,
    })

    // 自定义索引
    createCommonIndexs(tablename, RecordSchema)

    // 自定义虚拟字段
    createCommonVirtuals(tablename, RecordSchema)
    // RecordSchema.virtual('tableInfo', {
    //   ref: 'xin_table',
    //   localField: 'table_id',
    //   foreignField: '_id',
    //   count: false,
    //   justOne: true,
    // })
    // console.log('-----virtuals', JSON.stringify(virtuals, null, 2))
    virtuals.forEach(item => {
      this.virtualFunc(RecordSchema, {
        name: item.name,
        ref: item.ref,
        localField: item.local_field,
        foreignField: item.foreign_field,
        count: item.count,
        justOne: item.just_one,
      })
    })
    // console.log('-----fieldVirtuals', JSON.stringify(fieldVirtuals, null, 2))
    // 自定义字段的虚拟化
    fieldVirtuals.forEach(item => {
      this.virtualFunc(RecordSchema, item)
    })

    if (mongoose.models?.[table_id]) {
      this.destroy(table_id)
    }

    const result = {
      tabletype: 'custom',
      table_id,
      tablename,
      tableInfo,
      Model: mongoose.model(table_id, RecordSchema, tablename),
      Populate: customVirtuals.concat(fieldVirtuals.map(a => a.populate)),
    }
    this.models[table_id] = result
    this.models[tablename] = result
    // this.app.models[tablename] = result.Model
    return result
  }

  // 系统内置表模型化
  inset_table_model (fn) {
    const Model = fn(this.app)
    const tablename = Model.collection.name

    // console.log('--collection name--', tablename)

    const result = {
      tabletype: 'inset',
      tablename,
      Model,
      // Populate: customVirtuals.concat(fieldVirtuals.map(a => a.populate)),
    }
    this.models[tablename] = result
    // this.app.models[tablename] = result.Model
    return result
  }

  destroy (table_id) {
    table_id = table_id.toString()
    if (mongoose.models?.[table_id]) {
      delete mongoose.models[table_id];
    }
    if (mongoose.connection?.models?.[table_id]) {
      delete mongoose.connection.models[table_id];
    }
    if (mongoose.modelSchemas?.[table_id]) {
      delete mongoose.modelSchemas[table_id];
    }
    if (this.models?.[table_id]) {
      delete this.models[table_id]
    }
    Object.values(this.models).forEach(item => {
      if (table_id === item.table_id) {
        // console.log('已删除：', table_id, item.table_id, item.tablename)
        delete this.models[item.tablename]
      }
    })
  }

  // 对外导出一些模块
  createCommonOptions = createCommonOptions
  createCommonBeforeFields = createCommonBeforeFields
  createCommonAfterFields = createCommonAfterFields
  createCommonIndexs = createCommonIndexs
  createCommonVirtuals = createCommonVirtuals
  createEnumAttributes = createEnumAttributes

}

module.exports = XinMongo
