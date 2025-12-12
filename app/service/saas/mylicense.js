'use strict';

const BaseService = require('../../core/baseService')
const nodetools = require('@xinserver/tools/lib/node')

const LicenseObject = {
  // lowcode_isopen: {
  //   title: '低代码是否开启',
  //   type: Boolean,
  //   default: false,
  // },
  // expire_time: {
  //   title: '过期日期',
  //   type: Number,
  //   default: 0,
  // },
  // tableGroupNumber: {
  //   title: '数据表分组数量',
  //   type: Number,
  //   default: 10,
  // },
  // tableNumber: {
  //   title: '数据表数量',
  //   type: Number,
  //   default: 10,
  // },
  // tableRecordNumber: {
  //   title: '数据表记录数量',
  //   type: Number,
  //   default: 500,
  // },
  // screenGroupNumber: {
  //   title: '可视化分组数量',
  //   type: Number,
  //   default: 10,
  // },
  // screenNumber: {
  //   title: '可视化画面数量',
  //   type: Number,
  //   default: 10,
  // },
  // organizationNumber: {
  //   title: '部门数量',
  //   type: Number,
  //   default: 10,
  // },
  // userNumber: {
  //   title: '用户数量',
  //   type: Number,
  //   default: 10,
  // },
  // roleNumber: {
  //   title: '用户角色数量',
  //   type: Number,
  //   default: 10,
  // },
  // userTagNumber: {
  //   title: '用户标签数量',
  //   type: Number,
  //   default: 10,
  // },
  // permissionNumber: {
  //   title: '自定义权限数量',
  //   type: Number,
  //   default: 10,
  // },
  // dictionaryRecordNumber: {
  //   title: '数据字典数量',
  //   type: Number,
  //   default: 10,
  // },
  // workflowNumber: {
  //   title: '工作流数量',
  //   type: Number,
  //   default: 10,
  // },
  // workflowRecordNumber: {
  //   title: '工作流执行数量',
  //   type: Number,
  //   default: 10,
  // },
  // reportNumber: {
  //   title: '报表数量',
  //   type: Number,
  //   default: 10,
  // },
  // reportViewNumber: {
  //   title: '报表视图数量',
  //   type: Number,
  //   default: 10,
  // },
  // reportRecordNumber: {
  //   title: '报表记录数量',
  //   type: Number,
  //   default: 10,
  // },
  // diskSize: {
  //   title: '资源存储空间',
  //   type: Number,
  //   default: 1073741824, // 1GB
  // },
  // smsNumber: {
  //   title: '短信数量',
  //   type: Number,
  //   default: 0,
  // },
  // customapiNumber: {
  //   title: '自定义接口',
  //   type: Number,
  //   default: 0,
  // },
  // ai_moonshot: {
  //   title: 'Moonshot Tokens',
  //   type: Number,
  //   default: 10000,
  // },
  // ai_deepseek: {
  //   title: 'DeepSeek Tokens',
  //   type: Number,
  //   default: 10000,
  // },
  // ai_openai: {
  //   title: 'OpenAI Tokens',
  //   type: Number,
  //   default: 10000,
  // },
}

class XinService extends BaseService {

  // 暂时无用
  async list ({ filter = {}, select = {}, pageSize = 20, current = 1, sort = {}, }) {
    const token_user_id = this.ctx.xinToken?.user_id || undefined

    const limit = pageSize || 1000
    const skip = limit * ((current || 1) - 1)

    const filterQuery = this._mongoFilterCreate({
      status: filter?.status === false ? false : true,
      ...(filter || {}),
    })

    const listRes = await this.app.models.xin_saas_mylicense.Model
                            .find(filterQuery)
                            .select({
                              platform_type: 1,
                              from_type: 1,
                              name: 1,
                              logo: 1,
                              url: 1,
                              app_project_id: 1,
                              create_time: 1,
                            })
                            .populate([
                              { path: 'appProjectInfo', select: '_id logo name english_name welcome' },
                              { path: 'createUserInfo', select: '_id nickname name' },
                            ])
                            .skip(skip)
                            .limit(limit)
                            .sort({
                              ...(sort || {}),
                            })
                            .lean()
                            .exec()
    const countRes = await this.app.models.xin_saas_mylicense.Model.countDocuments(filterQuery).exec()

    const result = await Promise.all([ listRes, countRes ])
    return { data: result[0], count: result[1], }
  }

  async count (filter = {}) {
    const token_user_id = this.ctx.xinToken?.user_id || undefined

    const filterQuery = this._mongoFilterCreate({
      status: filter?.status === false ? false : true,
      ...(filter || {}),
    })

    const result = await this.app.models.xin_saas_mylicense.Model.countDocuments(filterQuery).exec()

    return result || 0
  }

  async add (data = {}) {
    const token_user_id = this.ctx.xinToken?.user_id || undefined

    const result = await new this.app.models.xin_saas_mylicense.Model({
      ...(data || {}),
      create_user_id: token_user_id,
    }).save()

    return result?.toObject?.()
  }

  async update ({ filter = {}, data = {}, }) {
    const token_user_id = this.ctx.xinToken?.user_id || undefined

    const filterQuery = this._mongoFilterCreate({
      ...(filter || {}),
    })

    const updateQuery = this._emptyValueFilters({
      ...(data || {}),
      update_time: Date.now(),
    })

    const result = await this.app.models.xin_saas_mylicense.Model
                                  .findOneAndUpdate(
                                    filterQuery,
                                    updateQuery,
                                    { new: true }
                                  )
                                  .select({ _id: 1, })
                                  .lean()
                                  .exec()

    return result
  }

  async batchUpdate ({ filter = {}, data = {}, }) {
    const token_user_id = this.ctx.xinToken?.user_id || undefined

    const filterQuery = this._mongoFilterCreate({
      ...(filter || {}),
    })

    const updateQuery = this._emptyValueFilters({
      ...(data || {}),
      update_time: Date.now(),
    })

    const result = await this.app.models.xin_saas_mylicense.Model
                                  .updateMany(
                                    filterQuery,
                                    updateQuery,
                                    { new: true }
                                  )
                                  .exec()

    return result
  }

  async updateLicense (project_id, data) {
    const result = await this.app.models.xin_saas_mylicense.Model
                                  .findOneAndUpdate({
                                    status: true,
                                  }, {
                                    ...(data || {}),
                                    update_time: Date.now(),
                                  }, { new: true, upsert: true, })
                                  .exec()

    return result
  }
  

  // 低代码平台授权
  async lowcode_detail ({ project_id, }) {
    const result = await this.app.models.xin_saas_mylicense.Model
                                  .findOne({
                                    project_id,
                                    status: true,
                                  })
                                  .sort({
                                    create_time: -1,
                                  })
                                  .exec()
    return result
  }

  async delete (filter = {}) {
    const token_user_id = this.ctx.xinToken?.user_id || undefined

    const filterQuery = this._mongoFilterCreate({
      ...(filter || {}),
    })

    const result = await this.app.models.xin_saas_mylicense.Model
                                  .findOneAndDelete(filterQuery, {
                                    projection: { _id: 1, },
                                    lean: true,
                                  })
                                  .exec()

    return result
  }

  // 加密
  async encrypt_licenseString (licenseInfo, options) {
    // licenseInfo 已经存在的授权信息。存在的时候，从里面取值
    const license_string = nodetools.aes_encrypt(
      JSON.stringify({
        ...(licenseInfo || {}),
        ...(Object.fromEntries(Object.keys(LicenseObject).map(key => [
          key,
          licenseInfo?.[key] ?? LicenseObject[key].default,
        ]))),
      }),
      options
    )
    return license_string
  }

  // 解密
  async decrypt_licenseString (license_string, options) {
    if (!license_string) {
      return
    }
    console.log('--decrypt_licenseString-33--', license_string, options)
    try {
      const newlicense_string = nodetools.aes_decrypt(license_string, options)
      const licenseInfo = newlicense_string ? JSON.parse(newlicense_string) : undefined
      return licenseInfo
    } catch (err) {
      console.error(err)
      return
    }
  }

}

module.exports = XinService
