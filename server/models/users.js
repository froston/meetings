const db = require('../db')

exports.userExists = async ({ uid, email }) => {
  const users = await db.query(`SELECT id, email FROM users WHERE uid = ? AND email = ?`, [uid, email])
  return users && users[0] ? true : false
}

exports.getUserByUID = async (uid) => {
  const users = await db.query(`SELECT id, email, meta FROM users WHERE uid = ?`, [uid])

  const user = users[0]

  if (user && user.meta) {
    user.meta = JSON.parse(user.meta)
  }
  return user
}
