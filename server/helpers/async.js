Array.prototype.mapAsync = async function (cb) {
  for (let i = 0; i < this.length; i++) {
    if (i in this) {
      this[i] = await cb(this[i], i)
    }
  }
}

Array.prototype.forEachAsync = async function (cb) {
  for (let i = 0; i < this.length; i++) {
    if (i in this) {
      await cb(await this[i], i)
    }
  }
}
