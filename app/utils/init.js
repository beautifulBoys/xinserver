
// eslint-disable-next-line no-extend-native
Array.prototype.asyncmap = async function (func) {
  const arr = []
  for (let i = 0; i < this.length; i++) {
    const item = this[i]
    arr.push(await func(item, i))
  }
  return arr
}
