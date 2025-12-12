'use strict';

const BaseService = require('../../core/baseService')
const { execSync, exec, } = require('child_process')
const path = require('path')
const axios = require('axios')
const fs = require('fs')

class XinService extends BaseService {

  // 保存文件
  saveFile ({ file, targetUrl, }) {
    const url = '/resource/' + targetUrl.split('/resource/')[1]
    const dirPath = targetUrl.split('/').slice(0, -1).join('/')

    this.service.common.file.mkdir(dirPath)
    this.service.common.file.copyFile(file.filepath, targetUrl) // 拷贝文件
    this.service.common.file.deleteFile(file.filepath) // 删除源文件

    const stats = fs.statSync(targetUrl)
    const result = {
      // birthtime: stats.birthtime,
      provider: 'local_cdn',
      name: file.filename,
      mime_type: file.mimeType,
      size: stats.size,
      url: url,
    }

    return result
  }

  // 安全删除目录或文件
  deleteFile (targetUrl) {
    try {
      const result = fs.rmSync(targetUrl, { force: true, recursive: true, })
      return result
    } catch (err) {
      return
    }
  }

  // 安全创建目录
  mkdir (targetUrl) {
    try {
      const result = fs.mkdirSync(targetUrl, { recursive: true })
      return result
    } catch (err) {
      return
    }
  }

  // 安全拷贝目录和文件
  copyFile (sourceUrl, targetUrl) {
    try {
      fs.mkdirSync(path.dirname(targetUrl), { recursive: true })
      const result = fs.cpSync(sourceUrl, targetUrl, { recursive: true, force: true })
      return result
    } catch (err) {
      return
    }
  }

  // 安全压缩
  compression (sourceUrl, targetUrl) {
    try {
      const result = execSync(`tar -czvf ${targetUrl} -C ${sourceUrl} .`, { encoding: 'utf8' }).trim()
      return result
    } catch (err) {
      return
    }
  }

  // 安全解压
  decompression (sourceUrl, targetUrl) {
    try {
      const result = execSync(`tar -xzvf ${sourceUrl} -C ${targetUrl}`, { encoding: 'utf8' }).trim()
      return result
    } catch (err) {
      return
    }
  }

  // 读取文件内容
  readFileContent ({ path, encoding, }) {
    try {
      const result = fs.readFileSync(path, { encoding: encoding || 'utf8' })
      return result
    } catch (err) {
      return
    }
  }

  // 往文件内写入内容
  writeFileContent ({ path, content, encoding, }) {
    try {
      const result = fs.writeFileSync(path, content, { encoding: encoding || 'utf8' })
      return result
    } catch (err) {
      return
    }
  }

}

module.exports = XinService
