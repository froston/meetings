const db = require('../db')
const { listUsers } = require('../auth/firebase')

const getAll = async () => {
  const res = await listUsers()
  const users = res.users
  await users.mapAsync(async (user) => {
    const regUser = await getUserByUID(user.uid)
    if (regUser && regUser.id > 0) {
      user = { ...regUser, ...user }
    }
    return user
  })
}

const userExists = async ({ uid, email }) => {
  const users = await db.query(`SELECT id, email FROM users WHERE uid = ? AND email = ?`, [uid, email])
  return users && users[0] ? true : false
}

const getUserByUID = async (uid) => {
  const users = await db.query(`SELECT id, email, meta FROM users WHERE uid = ?`, [uid])
  const user = users[0]
  if (user && user.meta) {
    user.meta = JSON.parse(user.meta)
  }
  return user
}

const createUser = async (data) => {
  const newUser = {
    email: data.email,
    uid: data.uid,
    meta: JSON.stringify(data.meta),
  }
  return await db.query('INSERT INTO users SET ?', newUser)
}

const updateUser = async (id, data) => {
  const updatedUser = {
    email: data.email,
    uid: data.uid,
    meta: JSON.stringify(data.meta),
  }
  return await db.query('UPDATE users SET ? WHERE id = ?', [updatedUser, id])
}

const removeUser = async (id) => {
  return await db.query('DELETE FROM users WHERE id = ?', id)
}

module.exports = {
  getAll,
  userExists,
  getUserByUID,
  createUser,
  updateUser,
  removeUser,
}
