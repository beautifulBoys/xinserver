
const fs = require('fs')
const path = require('path')

class XinPlugin {
  constructor (app) {
    this.app = app
  }

  async init () {
    const pluginsDir = path.join(this.app.baseDir, 'plugins')
    fs.readdirSync(pluginsDir).forEach(file => {
      if (file.endsWith('.js')) {
        const pluginFunc = require(path.join(pluginsDir, file))
        pluginFunc(this.app)
      }
    })
    console.log('[xin-plugin] 初始化成功 ✅')
  }


}

module.exports = XinPlugin