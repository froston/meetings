const { ObjectID } = require('mongodb')

const usersCollection = 'students'

const getAll = (db, cb) => {
  const collection = db.collection(usersCollection)
  collection.find({}).toArray((err, users) => {
    return cb(err, users)
  })
};

const getById = (db, id, cb) => {
  const userId = new ObjectID(id) 
  const collection = db.collection(usersCollection)
  collection.findOne({ _id: userId }, (err, user) => {
    if (err) { 
      return console.log(err)
    }
    return cb(err, user)
  })
}

module.exports = {
  getAll,
  getById
}
