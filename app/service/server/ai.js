'use strict';

const BaseService = require('../../core/baseService')
const mongoose = require('mongoose')
const OpenAI = require('openai')

class XinService extends BaseService {


  // 发送
  async moonshot (data) {
    const { settings, client } = this.app.system_ai?.moonshot || {}
    try {
      const completion = await client?.chat.completions.create({
        model: settings.model || 'moonshot-v1-8k',
        messages: [
          { role: 'user', content: data.content || '', },
        ],
        web_search: data.web_search || false,
        temperature: 0.3,
      })
      // console.log('---completion----', completion)
      const result = completion?.choices[0]?.message?.content
      const tokens = completion?.usage?.total_tokens
      return { result, tokens, }
    } catch (err) {
      console.error('【moonshot报错】:', err)
      return null
    }
  }

  // 发送
  async deepseek (data) {
    const { settings, client } = this.app.system_ai?.deepseek || {}
    try {
      const completion = await client?.chat.completions.create({
        model: settings.model || 'deepseek-chat',
        messages: [
          { role: 'user', content: data.content || '', },
        ],
        web_search: data.web_search || false,
        temperature: 0.3,
      })
      // console.log('---completion----', completion)
      const result = completion?.choices[0]?.message?.content
      const tokens = completion?.usage?.total_tokens
      return { result, tokens, }
    } catch (err) {
      console.error('【deepseek报错】:', err)
      return null
    }
  }


  async record_add (data) {
    const token_user_id = this.ctx.xinToken?.user_id || undefined

    const result = await new this.app.models.xin_ai_record.Model({
      ...(data || {}),
      create_user_id: token_user_id,
    }).save()

    return result
  }


}

module.exports = XinService
