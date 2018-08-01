const { ObjectID } = require('mongodb')
const { getDb } = require('../db')

const studentsCollection = 'students'

const getAll = (cb) => {
  const collection = getDb().collection(studentsCollection)
  collection.find({}).toArray((err, users) => {
    return cb(err, users)
  })
};

const getById = (id, cb) => {
  const collection = getDb().collection(studentsCollection)
  const userId = new ObjectID(id)
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
