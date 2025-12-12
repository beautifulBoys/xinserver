'use strict';

const BaseController = require('../core/baseController')
const axios = require('axios')
const reportSdk = require('../sdk/report')


class XinController extends BaseController {

  async csdn () {
    const url = 'https://bizapi.csdn.net/blog-console-api/v3/mdeditor/saveArticle'
    const datas = {
      "title": "解读量化投资技术驱动的财富增长新引擎111131",
      "markdowncontent": "在当今数字化时代市场111的稳定和发展为投资者创造更多的财富增长机会。",
      "content": "在当今数字化创造更1111多的财富增长机会。",
      "readType": "public",
      "level": 0,
      "tags": "Python,量化,miniQMT,QMT1,量化交易,量化投资",
      "status": 0,
      "categories": "量化科普",
      "type": "original",
      "original_link": "",
      "authorized_status": false,
      "Description": "",
      "not_auto_saved": "1",
      "source": "pc_mdeditor",
      "cover_images": [
          "https://imgconvert.csdnimg.cn/aHR0cHM6Ly9hdmF0YXIuY3Nkbi5uZXQvNy83L0IvMV9yYWxmX2h4MTYzY29tLmpwZw"
      ],
      "cover_type": 1,
      "is_new": 1,
      "vote_id": 0,
      "resource_id": "",
      "pubStatus": "publish"
    }
    const res = await axios.request({
      method: 'post',
      url,
      headers: {
        "accept": "*/*",
        "accept-language": "zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6",
        "content-type": "application/json",
        "priority": "u=1, i",
        "sec-ch-ua": "\"Not A(Brand\";v=\"8\", \"Chromium\";v=\"132\", \"Microsoft Edge\";v=\"132\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"macOS\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site",
        "x-ca-key": "203803574",
        "x-ca-nonce": "7b80f64d-fd2e-4ce7-af4f-2aa28b09b2f5",
        "x-ca-signature": "PiZ08TnPXwcWPCVLP6rRF6kdWalocxFxmFc5cnFKtfU=",
        "x-ca-signature-headers": "x-ca-key,x-ca-nonce",
        "cookie": "Hm_up_6bcd52f51e9b3dce32bec4a3997715ac=%7B%22islogin%22%3A%7B%22value%22%3A%220%22%2C%22scope%22%3A1%7D%2C%22isonline%22%3A%7B%22value%22%3A%220%22%2C%22scope%22%3A1%7D%2C%22isvip%22%3A%7B%22value%22%3A%220%22%2C%22scope%22%3A1%7D%7D; cf_clearance=1vqLENMNUTrBOE4BshvZxiqQiNM4BROz2G55iVmZFC0-1716173021-1.0.1.1-DFmD48yzUsWWtRnv1yvsu4oVUNoznsS3zDorFycIEDIr89G9sXRvt91e6ZowEIpd5t05KJ9BgjbVZRczWnNSzw; uuid_tt_dd=10_10077424760-1739263954892-308515; fid=20_85659596091-1739263955153-878582; c_segment=3; dc_sid=b37bd86f4147b9e8b237c95debe10582; loginbox_strategy=%7B%22taskId%22%3A349%2C%22abCheckTime%22%3A1739263955992%2C%22version%22%3A%22exp11%22%7D; Hm_lvt_6bcd52f51e9b3dce32bec4a3997715ac=1739263956; HMACCOUNT=E328B78DB5D3B351; SESSION=98ee4c4a-797b-4b35-8b08-4f599acb97f7; UserName=yunce_touzi; UserInfo=cbd9b29afcb74ab49eaf63632466abb2; UserToken=cbd9b29afcb74ab49eaf63632466abb2; UserNick=yunce_touzi; AU=92B; UN=yunce_touzi; BT=1739264484360; p_uid=U010000; tfstk=gnW-LfYGwonJkZ9gE8NDxYt6IOE0v9IrkaSsKeYoOZQAYwHoEpvkOHTA8YXhxM1KpG8qEgXlxEHCANKHt7Sop0WAWvDuz7SIppvQSP2gIgoyLpaiG72sG4-kf3wHPYiXUH2frpXYIgSrc03QjswiJPdnPaTCRQOfcH8XA0_IFjZvAH0SOY_CcoL2YbgSdYtjlH-Jde_BdoIXuHG9bJ8jPeMd6upDgygsfblPH3dJJv0jpvG6xVxhVEHIdUKJwjIWkvMCHsqHf_YTHqTcAG5BM9erEpSc6wCClkMBJstOWhbuhYpCGZB91iztUUCfz9pk_JnpD1IfyTvL60-cei6w9Tz-hUQVc1vPCrkd5ijGUIWLWqTFZhJX2sEIGUOC4HXGBKXoSFKnNoExTXRW04tCxw9vyLo6DFq88Xleir-vSoUsTXRW0nLgmghETI4V.; csdn_newcert_yunce_touzi=1; x_inscode_token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJjcmVkZW50aWFsIjoiIiwiY3NkblVzZXJuYW1lIjoieXVuY2VfdG91emkiLCJ1c2VySWQiOiI2N2FiMjhlY2QwMzZmNTUyODE0MDgxNjAiLCJ1c2VybmFtZSI6Inl1bmNlX3RvdXppIn0.5rFpS6AaxSC7MCLp07s37p3338kAFq-kvhk2FfNdRxI; c_ins_prid=-; c_ins_rid=1739270386525_447553; c_ins_fref=https://mp.csdn.net/mp_blog/creation/editor; c_ins_fpage=/index.html; c_ins_um=-; ins_first_time=1739270386715; historyList-new=%5B%5D; __gads=ID=53ef15dde8b96d7d:T=1716173023:RT=1739349073:S=ALNI_MbtSnOPNyCNSfI65s9fd1-PuP7GeA; __gpi=UID=00000e07897e0dce:T=1716173023:RT=1739349073:S=ALNI_MZfLzFEwFGZHqf0Psq6VxMKapQ9kQ; __eoi=ID=8f1a28935fe91f15:T=1739270031:RT=1739349073:S=AA-AfjZIkWBN-jjECJuL3S7w8qSE; FCNEC=%5B%5B%22AKsRol91JtlQ8dMQEigTUGU08hwe6-kJQwWDV2G8UVmH-jVvJlZ4XQ05ZVChpaSz21FHOjJPhiPLcbjmDQziAeYcjeHMggTD9Qy17lkVV4g_xl5--z2nnjMc5lXU6JEaKWdzNLiv4zZrEH5X3ojJdE4MzErb0vF1Ww%3D%3D%22%5D%5D; _clck=1u66lkx%7C2%7Cfte%7C0%7C1599; _clsk=1c7uqap%7C1739421957864%7C1%7C0%7Ct.clarity.ms%2Fcollect; dc_session_id=10_1739434098154.320572; c_page_id=default; creativeSetApiNew=%7B%22toolbarImg%22%3A%22https%3A//img-home.csdnimg.cn/images/20231011044944.png%22%2C%22publishSuccessImg%22%3A%22https%3A//img-home.csdnimg.cn/images/20240229024608.png%22%2C%22articleNum%22%3A0%2C%22type%22%3A0%2C%22oldUser%22%3Afalse%2C%22useSeven%22%3Atrue%2C%22oldFullVersion%22%3Afalse%2C%22userName%22%3A%22yunce_touzi%22%7D; c_pref=default; c_ref=default; c_first_ref=default; c_first_page=https%3A//editor.csdn.net/md/; c_dsid=11_1739434107206.633758; log_Id_pv=3; Hm_lpvt_6bcd52f51e9b3dce32bec4a3997715ac=1739434107; log_Id_view=102; dc_tos=srm3za; log_Id_click=6",
        "Referer": "https://editor.csdn.net/",
        "Referrer-Policy": "strict-origin-when-cross-origin",
      },
      data: JSON.stringify(datas),
      // body: JSON.stringify(datas),
    })
    
    console.log('----res----', res)


    this.ctx.body = this.app.xinError.success()
  }
  
  async insertMany () {
    const bodyData = this.ctx.request.body || {}
    
    const arr = []
    const result = await this.app.models.xin_test.Model
                  .insertMany(arr, {
                    ordered: true,
                  })
    this.ctx.body = this.app.xinError.success(arr)
  } 

  async list () {
    const bodyData = this.ctx.request.body || {}

    const result = await this.service.test.list(bodyData)

    this.ctx.body = this.app.xinError.success(result)
  }

  async add () {
    const bodyData = this.ctx.request.body || {}

    const result = await this.service.test.add(bodyData)

    this.ctx.body = this.app.xinError.success(result)
  }

  async update () {
    const bodyData = this.ctx.request.body || {}
		const filter = bodyData.filter || {}
		const data = bodyData.data || {}

    const result = await this.service.test.update({ filter, data, })

    this.ctx.body = this.app.xinError.success(result)
  }

  async detail () {
    const bodyData = this.ctx.request.body || {}
		const filter = bodyData || {}

    const result = await this.service.test.detail(filter)

    this.ctx.body = this.app.xinError.success(result)
  }

  async delete () {
    const bodyData = this.ctx.request.body || {}
		const filter = bodyData || {}

    const result = await this.service.test.delete(filter)

    this.ctx.body = this.app.xinError.success(result)
  }

  async run () {
    const bodyData = this.ctx.request.body || {}
    const _id = bodyData._id
    const code = `
({
  main: function (contexts, data) {
    return new Promise(async (resolve, reject) => {
      const value = contexts.dayjs.tz().format('YYYY-MM-DD HH:mm:ss')
      contexts.next(value)
      resolve(value)
    })
  },
})
`
    const scriptObj = await this.app.xin.runScriptFunc(code)
    scriptObj.main({
      dayjs: this.app.dayjs.tz,
      next: (result) => {
        console.log(result)
      },
    }, {})

    this.ctx.body = this.app.xinError.success()
  }

  async report () {
    
    const reportList = await this.app.models.xin_report.Model.find({ state: 0, })

    const statisticList = []

    for (let i = 0; i < reportList.length; i++) {
      const reportInfo = reportList[i]
      const moduleData = reportInfo?.body
      const startTime = this.app.dayjs.tz().startOf(reportInfo.cycle).add(-1, reportInfo.cycle).valueOf()
      const endTime = this.app.dayjs.tz().startOf(reportInfo.cycle).valueOf()
      const customMatchs = {
        create_time: { $gte: startTime, $lt: endTime },
      }
      // 查询记录是否已存在
      const isExist = await this.app.models.xin_report_record.Model.countDocuments({ cycle: reportInfo.cycle, date_timestamp: startTime, }).exec()
      // console.log('isExist', isExist)
      if (isExist) continue

      const resultList = []
      if (reportInfo.moduleType === 'huizong') {
        const moduleInfo = moduleData?.reportViewInfo?.body
        const table_id = moduleInfo?.data?.attributes?.tableInfo?._id

        const params = await reportSdk.huizong.createSearchOption(moduleInfo, { customMatchs })
        const { data = [] } = await this.service.db.index.aggregate(params)
        resultList.push(...data)
      } else if (reportInfo.moduleType === 'mingxi') {
        const moduleInfo = moduleData?.reportViewInfo?.body
        const table_id = moduleInfo?.data?.attributes?.tableInfo?._id

        const params = await reportSdk.mingxi.createSearchOption(moduleInfo, { customMatchs })
        const { data = [] } = await this.service.db.index.model(params)
        resultList.push(...data)
      }
      let title
      if (reportInfo.cycle === 'day') {
        title = '[日报] ' + this.app.dayjs.tz(startTime).format('YYYY-MM-DD')
      } else if (reportInfo.cycle === 'week') {
        title = '[周报] ' + this.app.dayjs.tz(startTime).format('YYYY年 第w周')
      } else if (reportInfo.cycle === 'month') {
        title = '[月报] ' + this.app.dayjs.tz(startTime).format('YYYY年 MM月')
      } else if (reportInfo.cycle === 'quarter') {
        title = '[季度报] ' + `${this.app.dayjs.tz(startTime).format('YYYY年')} ${this.app.dayjs.tz(startTime).quarter()}季度`
      } else if (reportInfo.cycle === 'year') {
        title = '[年报] ' + this.app.dayjs.tz(startTime).format('YYYY年')
      }
      statisticList.push({
        report_id: reportInfo._id,
        cycle: reportInfo.cycle,
        title,
        date: this.app.dayjs.tz(startTime).format('YYYY-MM-DD'),
        date_timestamp: startTime,
        body: resultList,
      })
    }
    // 保存到统计数据表
    if (statisticList.length) {
      await this.app.models.xin_report_record.Model.insertMany(statisticList)
    }

    this.ctx.body = this.app.xinError.success(statisticList)
  }

}

module.exports = XinController
