// 这个暂时没有用
module.exports = agent => {
  // 在这里写你的初始化逻辑。

  // 你还可以通过 messenger 对象发送消息给 App Worker。
  // 但是，需要等 App Worker 启动成功后才能发送，否则可能丢失消息。
  agent.messenger.on('egg-ready', () => {

  })
}