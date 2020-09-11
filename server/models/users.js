const async = require('async')
const { getDb } = require('../db')
const { listUsers } = require('../auth/firebase')

exports.getAll = (cb) => {
  listUsers((res) => {
    const users = res.users
    async.map(
      users,
      (user, done) => {
        getUserByUID(user.uid, (err, regUser) => {
          if (err) throw err
          if (regUser && regUser.id > 0) {
            user = { ...regUser, ...user }
          }
          done(null, user)
        })
      },
      cb
    )
  })
}

exports.userExists = ({ uid, email }, cb) => {
  getDb().query(`SELECT id, email FROM users WHERE uid = ? AND email = ?`, [uid, email], (err, users) => {
    if (err) throw err
    cb(err, users && users[0] ? true : false)
  })
}

const getUserByUID = (uid, cb) => {
  getDb().query(`SELECT id, email, meta FROM users WHERE uid = ?`, [uid], (err, users) => {
    if (err) throw err
    const user = users[0]
    if (user && user.meta) {
      user.meta = JSON.parse(user.meta)
    }
    cb(err, user)
  })
}
exports.getUserByUID = getUserByUID

exports.createUser = (data, cb) => {
  const newUser = {
    email: data.email,
    uid: data.uid,
    meta: JSON.stringify(data.meta),
  }
  getDb().query('INSERT INTO users SET ?', newUser, (err, res) => {
    if (err) throw err
    cb(err, res)
  })
}

exports.updateUser = (id, data, cb) => {
  const updatedUser = {
    email: data.email,
    uid: data.uid,
    meta: JSON.stringify(data.meta),
  }
  getDb().query('UPDATE users SET ? WHERE id = ?', [updatedUser, id], (err) => {
    if (err) throw err
    cb(err)
  })
}

exports.removeUser = (id, cb) => {
  getDb().query('DELETE FROM users WHERE id = ?', id, (err) => {
    if (err) throw err
    cb(null)
  })
}
