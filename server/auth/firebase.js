const firebaseAdmin = require('firebase-admin')
const userModel = require('../models/users')
const config = require('../config')

firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert({
    project_id: config.firebase.project_id,
    private_key: config.firebase.private_key,
    client_email: config.firebase.client_email,
  }),
})

exports.validateToken = async (req, res, next) => {
  const authorization = req.headers.authorization
  if (authorization && authorization.startsWith('Bearer ')) {
    const idToken = authorization.split('Bearer ')[1]
    try {
      req.currentUser = await firebaseAdmin.auth().verifyIdToken(idToken)

      const userExists = await userModel.userExists(req.currentUser)
      if (userExists) {
        next()
      } else {
        res.status(401).send({ message: 'User is not registred' })
      }
    } catch (err) {
      res.status(401).send(err)
    }
  } else {
    res.status(401).send({ message: 'Missing authorization header' })
  }
}
