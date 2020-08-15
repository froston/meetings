const { getDb } = require('../db')

exports.getUserByEmail = (email, cb) => {
  getDb().query(`SELECT id, email FROM users WHERE email = ?`, [email], (err, users) => {
    cb(err, users[0])
  })
}
