'use strict';

const qiniu = require('qiniu')
const BaseService = require('../../core/baseService')

class XinService extends BaseService {

  async cdn_token (data) {
    const token_user_id = this.ctx.xinToken?.user_id || undefined

    const options = data || {}

    const mac = new qiniu.auth.digest.Mac(options.AccessKey, options.SecretKey)
    const putPolicy = new qiniu.rs.PutPolicy({
      scope: options.bucket,
      expires: 3600, // 秒
      returnBody: `{
        "provider": "qiniu_cdn",
        "name": $(fname),
        "filename": $(fname),
        "url": "",
        "size": $(fsize),
        "mime_type": $(mimeType),

        "key": $(key),
        "ext": $(ext),
        "imageInfo": $(imageInfo),
        "bucket": $(bucket)
      }`,
    })
    const token = putPolicy.uploadToken(mac)
    return { token }
  }

}

module.exports = XinService
