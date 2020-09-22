Array.prototype.mapAsync = async function (cb) {
  const res = []
  for (let i = 0; i < this.length; i++) {
    res[i] = Promise.resolve(this[i]).then((val) => {
      return cb(val, i)
    })
  }
  return Promise.all(res)
}

Array.prototype.forEachAsync = async function (cb) {
  for (let i = 0; i < this.length; i++) {
    if (i in this) {
      await cb(await this[i], i)
    }
  }
}
