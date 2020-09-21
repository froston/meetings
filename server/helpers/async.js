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
  const res = []
  for (let i = 0; i < this.length; i++) {
    if (i in this) {
      const p = Promise.resolve(this[i]).then((val) => {
        return cb(val, i)
      })
      res.push(p)
    }
  }
  await Promise.all(res)
}
