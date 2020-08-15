const firebaseAdmin = require('firebase-admin')
const serviceAccount = require('./serviceAccountKey.json')
const userModel = require('../models/users')

firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(serviceAccount),
})

exports.validateToken = async (req, res, next) => {
  const authorization = req.headers.authorization
  if (authorization && authorization.startsWith('Bearer ')) {
    const idToken = authorization.split('Bearer ')[1]
    try {
      const decodedToken = await firebaseAdmin.auth().verifyIdToken(idToken)
      req.currentUser = decodedToken

      userModel.getUserByEmail(req.currentUser.email, (err, user) => {
        if (err) throw err
        if (user) {
          next()
        } else {
          res.status(401).send({ message: 'User is not registred' })
        }
      })
    } catch (err) {
      res.status(401).send(err)
    }
  } else {
    res.status(401).send({ message: 'Missing authorization header' })
  }
}
