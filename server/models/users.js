const { BasicStrategy } = require('passport-http')
const btoa = require('btoa')
const { getDb } = require('../db')

const getUserByEmail = (email, cb) => {
  getDb().query(`SELECT * FROM users WHERE email = ?`, [email], (err, users) => {
    cb(err, users[0])
  })
}

exports.basicAuth = () =>
  new BasicStrategy((username, password, done) => {
    getUserByEmail(username, (err, user) => {
      if (err) {
        return done(err)
      }
      if (!user) {
        return done(null, false)
      }
      if (user.password !== btoa(password)) {
        return done(null, false)
      }
      return done(null, user)
    })
  })
