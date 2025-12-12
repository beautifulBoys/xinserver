'use strict'

const { Subscription } = require('egg')

class BaseSchedule extends Subscription {
  constructor(ctx) {
    super(ctx)

    this.xinConfig = ctx.app.xinConfig

    this._emptyValueFilters = this.app.xin._emptyValueFilters
    this._mongoFilterCreate = this.app.xin._mongoFilterCreate
    this.ObjectId = this.app.xin.ObjectId
  }

}

module.exports = BaseSchedule
