const { getDb } = require('../db')

exports.userExists = ({ uid, email }, cb) => {
  getDb().query(`SELECT id, email FROM users WHERE uid = ? AND email = ?`, [uid, email], (err, users) => {
    if (err) throw err
    cb(err, users && users[0] ? true : false)
  })
}

exports.getUserByUID = (uid, cb) => {
  getDb().query(`SELECT id, email, meta FROM users WHERE uid = ?`, [uid], (err, users) => {
    if (err) throw err
    const user = users[0]
    if (user && user.meta) {
      user.meta = JSON.parse(user.meta)
    }
    cb(err, user)
  })
}
