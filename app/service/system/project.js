'use strict';
const path = require('path')
const fs = require('fs')
const nodetools = require('@xinserver/tools/lib/node')
const BaseService = require('../../core/baseService')


class XinService extends BaseService {

  async list ({ filter = {}, select = {}, pageSize = 20, current = 1, sort = {}, }) {
    const token_user_id = this.ctx.xinToken?.user_id || undefined

    const limit = pageSize || 20
    const skip = limit * ((current || 1) - 1)

    const filterQuery = this._mongoFilterCreate({
      status: filter.status === false ? false : true,
      ...(filter || {}),
    })

    const listRes = this.app.models.xin_project.Model
                            .find(filterQuery)
                            .select({
                              ...(select || {
                                system_account_token: 0,
                                system_front_user_id: 0,
                                system_admin_user_id: 0,
                              }),
                            })
                            .skip(skip)
                            .limit(limit)
                            // .populate([
                            //   { path: 'createUserInfo', select: '_id name' },
                            // ])
                            .sort({
                              ...(sort || {}),
                            })
                            .lean()
                            .exec()
    const countRes = await this.app.models.xin_project.Model.countDocuments(filterQuery).exec()

    const result = await Promise.all([ listRes, countRes ])
    return { data: result[0], count: result[1], }
  }

  async count (filter = {}) {
    const token_user_id = this.ctx.xinToken?.user_id || undefined

    const filterQuery = this._mongoFilterCreate({
      status: filter.status === false ? false : true,
      ...(filter || {}),
    })

    const result = await this.app.models.xin_project.Model.countDocuments(filterQuery).exec()

    return result || 0
  }

  // 获取工号
  async getJobNo (data) {
    const project_id = this.ctx.xinProject || undefined
    const token_user_id = this.ctx.xinToken?.user_id || undefined

    const result = await this.app.models.xin_project.Model.findOneAndUpdate({
      _id: project_id,
    }, {
      $inc: { control_job_no: 1 },
    }, { new: true, select: { control_job_no: 1 }, })
    .exec()

    return String(result.control_job_no)
  }

  async add (data = {}) {
    const token_user_id = this.ctx.xinToken?.user_id || undefined

    const result = await new this.app.models.xin_project.Model({
      ...(data || {}),
      create_user_id: token_user_id,
    }).save()

    return result?.toObject?.()
  }

  async getAccount (filter = {}) {
    const project_id = this.ctx.xinProject || undefined
    const token_user_id = this.ctx.xinToken?.user_id || undefined

    const result = await this.app.models.xin_project.Model
                                  .findOne({
                                    _id: filter._id || project_id,
                                  })
                                  .select({
                                    system_account_token: 1,
                                    system_front_user_id: 1,
                                    system_admin_user_id: 1,
                                  })
                                  .exec()

    return result
  }

  async update ({ filter = {}, data = {} }) {
    const project_id = this.ctx.xinProject || undefined
    const token_user_id = this.ctx.xinToken?.user_id || undefined

    const filterQuery = this._mongoFilterCreate({
      ...(filter || {}),
      _id: filter._id || project_id,
    })

    const updateQuery = this._emptyValueFilters({
      ...(data || {}),
      update_time: Date.now(),
    })

    const result = await this.app.models.xin_project.Model
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

  // 读取授权信息
  async readLicense (p_id) {
    const project_id = p_id || this.ctx.xinProject || this.xinConfig.project_id || undefined
    if (!project_id) {
      this.ctx.logger.error(new Error('project_id缺失'))
      return
    }

    try {
      const licenseRes = await this.service.saas.mylicense.lowcode_detail({ project_id, })
      const licenseInfo = await this.service.saas.mylicense.decrypt_licenseString(licenseRes?.license_string)
      return {
        ...(licenseRes || {}),
        licenseInfo,
        license_string: licenseRes?.license_string,
      }
    } catch (err) {
      console.error(err)
      return
    }
  }

  async detail (filter = {}) {
    // 这里有个问题，当类型是platform的时候，project_id和_id都为空，此时查找的是数据库里面第一条数据。
    const project_id = this.ctx.xinProject || undefined
    const token_user_id = this.ctx.xinToken?.user_id || undefined

    if (!filter?._id && !project_id) {
      return
    }

    const filterQuery = this._mongoFilterCreate({
      ...(filter || {}),
      _id: filter?._id || project_id,
    })

    try {
      const result = await this.app.models.xin_project.Model
                                    .findOne(filterQuery)
                                    .select({
                                      parent_id: 0,
                                      system_account_token: 0,
                                      system_front_user_id: 0,
                                      system_admin_user_id: 0,
                                    })
                                    .lean()
                                    .exec()
      return result
    } catch (err) {
      return
    }
  }

  async detail_shortPath ({ short_path }) {
    const token_user_id = this.ctx.xinToken?.user_id || undefined

    const filterQuery = this._mongoFilterCreate({
      short_path,
    })

    let result = await this.app.models.xin_project.Model
                                  .findOne(filterQuery)
                                  .select({
                                    parent_id: 0,
                                    system_account_token: 0,
                                    system_front_user_id: 0,
                                    system_admin_user_id: 0,
                                  })
                                  .exec()

    return result ? JSON.parse(JSON.stringify(result)) : undefined
  }

  async delete (filter = {}) {
    const token_user_id = this.ctx.xinToken?.user_id || undefined

    const filterQuery = this._mongoFilterCreate({
      ...(filter || {}),
    })

    const result = await this.app.models.xin_project.Model
                                  .findOneAndDelete(filterQuery, {
                                    projection: { _id: 1, },
                                    lean: true,
                                  })
                                  .exec()

    return result
  }

  // 初始化SaaS项目、组织及权限信息
  async initProject (data) {
    const project_name = data.name || 'XinServer[未命名]'
    const project_description = data.description
    const project_id = this.xinConfig.project_id || this.ObjectId()
    const system_admin_user_id = this.ObjectId()
    const system_front_user_id = this.ObjectId()

    const machineId = nodetools.getMachineId()


    function getdbinfo (connectionUri) {
      connectionUri = connectionUri.split('://')[1]?.split('?')[0]
      const dbname = connectionUri.split('/')[1]
      connectionUri = connectionUri.split('/')[0].replace('@', ':')
      const connectionUris = connectionUri.split(':')
      return {
        dbname,
        dbusername: connectionUris[0],
        dbpassword: connectionUris[1],
        dbhost: connectionUris[2],
        dbport: connectionUris[3],
      }
    }

    const db_info = getdbinfo(this.app.config.mongoose?.client?.url)

    const system_user_token = await this.service.auth.account.createToken({
      type: 'login',
      usertype: 'inside',
      user_id: system_admin_user_id,
      project_id,
    }, '100y') // 一百年

    const license_string = await this.service.saas.mylicense.encrypt_licenseString({
      type: 'machineid',
      project_id: String(project_id),
      machineId,
      expire_time: this.app.dayjs.tz().add(7, 'day').valueOf(),
    })

    console.log('---初始化空间参数---', JSON.parse(JSON.stringify({
      type: 'login',
      user_id: system_admin_user_id,
      project_id,
    })), system_user_token)


    const session = await this.app.mongoose.startSession()

    let result

    try {
      await session.withTransaction(async () => {
        // 项目/组织相关
        const projectList = await this.app.models.xin_project.Model.create([{ // 新增项目表记录
          _id: project_id,
          name: project_name,
          description: project_description,
          system_account_token: system_user_token,
          system_admin_user_id,
          system_front_user_id,
          create_user_id: system_admin_user_id,
        }], { session, })

        // 用户权限相关
        await this.app.models.xin_user.Model.create([
          { // 新增系统后台账号用户
            _id: system_admin_user_id,
            gender: 1,
            usertype: 'inside',
            name: '系统账号',
            comment: '系统后台账号',
            password: '2fa2a603155e461c49bce34816593c0f', // abcd1234
            username: 'systemAccount',
            roles: [ 'system_admin' ], // 系统最高权限
            is_system_admin: true,
            job_no: '1001',
            token: [ system_user_token, ],
            state: 100,
            create_user_id: system_admin_user_id,
          },
          { // 新增系统前台账号用户
            _id: system_front_user_id,
            gender: 1,
            usertype: 'outside',
            name: '系统账号',
            comment: '系统前台账号',
            password: '2fa2a603155e461c49bce34816593c0f', // abcd1234
            username: 'systemFrontAccount',
            roles: [ 'system_front_admin' ], // 系统最高权限
            is_system_admin: true,
            job_no: '1002',
            token: [],
            state: 100,
            create_user_id: system_admin_user_id,
          },
        ], { session, })

        // 生成授权记录
        await this.app.models.xin_saas_mylicense.Model.create([{
          license_string,
          project_id,
          create_user_id: system_admin_user_id,
        }], { session, })

        await this.app.models.xin_option.Model.create([
          {
            key: 'system_setup',
            value: true,
            create_user_id: system_admin_user_id,
          },
          {
            key: 'dbinfo_mongo',
            value: nodetools.aes_encrypt(JSON.stringify(db_info)),
            create_user_id: system_admin_user_id,
          },
        ], { session, })

        result = { projectInfo: projectList[0], dbInfo: db_info, }
      })
      await this.initBasicData({
        create_user_id: system_admin_user_id,
      })
      // await this.initServerConfigFile({ project_id, })
      await this.updateFrontConfigFile({ project_id, })
      return result
    } catch (err) {
      this.ctx.logger.error('[事务失败]', err, err.stack)
      throw err
    } finally {
      session.endSession()
    }
  }

  async initBasicData ({ create_user_id, }) {
    const operationNoticeClassify_id = this.ObjectId()
    const operationNoticeTag_id = this.ObjectId()
    const operationNoticeLevel_id = this.ObjectId()
    const operationMessageClassify_id = this.ObjectId()
    const operationMessageTag_id = this.ObjectId()

    const result = await Promise.all([
      // 初始化基础数据-数据字典
      this.app.models.xin_dictionary.Model.create([
        {
          _id: operationNoticeClassify_id,
          inset: true,
          name: '通知公告-分类',
          value: 'operationNoticeClassify',
          create_user_id,
        },
        {
          _id: operationNoticeTag_id,
          inset: true,
          name: '通知公告-标签',
          value: 'operationNoticeTag',
          create_user_id,
        },
        {
          _id: operationNoticeLevel_id,
          inset: true,
          name: '通知公告-等级',
          value: 'operationNoticeLevel',
          create_user_id,
        },
        {
          _id: operationMessageClassify_id,
          inset: true,
          name: '消息通知-分类',
          value: 'operationMessageClassify',
          create_user_id,
        },
        {
          _id: operationMessageTag_id,
          inset: true,
          name: '消息通知-标签',
          value: 'operationMessageTag',
          create_user_id,
        },
      ]),
    ])
    return result
  }

  // 项目前端配置文件写入
  async updateFrontConfigFile ({ project_id, }) {
    const filePath = this.xinConfig.paths.frontConfigFile
    let content = fs.readFileSync(filePath, 'utf-8')
    content = content.replace(/project_id\s*:\s*["'].*?["']/,`project_id: "${project_id}"`)
    fs.writeFileSync(filePath, content, 'utf-8')
    return
  }

  // 项目首次启动的时候，生成配置文件内容
  async initServerConfigFile ({ project_id, }) {
    project_id = String(project_id)
    const filePath = this.xinConfig.paths.adminConfigFile
    const dataConfig = JSON.parse(fs.readFileSync(filePath, 'utf-8') || '{}')
    dataConfig.project_id = project_id
    fs.writeFileSync(filePath, JSON.stringify(dataConfig, null, 2), 'utf-8')
    return
  }

  async refreshSystemToken (data) {
    const project_id = data.project_id || this.ctx.xinProject || undefined
    const token_user_id = this.ctx.xinToken?.user_id || undefined

    // 查询系统账号
    const systemUserInfo = await this.app.models.xin_user.Model
                                          .findOne({
                                            is_system_admin: true,
                                            status: true,
                                          })
                                          .select({
                                            _id: 1,
                                          })
                                          .exec()
    let projectInfo
    if (systemUserInfo) {
      // 生成系统账号token
      const system_account_token = await this.service.auth.account.createToken({
        type: 'login',
        usertype: systemUserInfo.usertype,
        user_id: systemUserInfo._id,
        project_id,
      }, '100y')
      // 将token更新到projectInfo中
      projectInfo = await this.app.models.xin_project.Model
                                            .findByIdAndUpdate(project_id, {
                                              system_account_token: system_account_token,
                                            }, { new: true })
                                            .select({
                                              name: 1,
                                              status: 1,
                                              unique_id: 1,
                                              create_time: 1,
                                            })
                                            .exec()
    }
    return projectInfo
  }

}

module.exports = XinService
