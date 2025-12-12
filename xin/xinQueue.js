// 简单队列

class XinQueue {
  constructor ({ limit, }, app) {
    this.app = app
    this.status = false
    this.limit = limit || 1
    this.list = []
    this.taskMap = {}
  }

  add (task) {
    if (!task) return
    let arr = Array.isArray(task) ? task : [ task ]
    arr = arr.map(a => {
      a._id = this.app.xin.uuid()
      return a
    })
    this.list.push(...arr)
    // console.log('队列add：', this.list, this.list.length)
    if (!this.status) this.start()
  }

  next () {
    return new Promise((resolve, reject) => {
      if (!this.status) {
        resolve()
        return
      }
      const task = this.list.shift()
      if (this.status && task) {
        // console.log('队列next：', task, task._id)
        task.fn(task).then(res => {
          task.success?.(res)
        }).catch(err => {
          task.fail?.(err)
        }).finally(data => {
          resolve()
          this.next()
        })
      } else {
        this.status = false
        resolve()
      }
    })
  }

  stop () {
    this.status = false
  }

  async start () {
    this.status = true
    Array(this.limit).fill(1).forEach(() => this.next())
  }

}

module.exports = XinQueue
