const { ObjectID } = require('mongodb')
const { getDb } = require('../db')

const studentsCollection = 'students'

exports.getAll = (cb) => {
  const collection = getDb().collection(studentsCollection)
  collection.find({}).toArray((err, students) => {
    return cb(err, students)
  })
};

exports.getById = (id, cb) => {
  const collection = getDb().collection(studentsCollection)
  const _id = new ObjectID(id)
  collection.findOne({ _id }, cb)
}

exports.createStudent = (newStudent, cb) => {
  const collection = getDb().collection(studentsCollection)
  collection.insert(newStudent, cb);
}

exports.updateStudent = (id, studentToUpdate, cb) => {
  const collection = getDb().collection(studentsCollection)
  const _id = new ObjectID(id)
  collection.updateOne({ _id }, { $set: studentToUpdate }, cb);
}

exports.removeStudent = (id, cb) => {
  const collection = getDb().collection(studentsCollection)
  const _id = new ObjectID(id)
  collection.deleteOne({ _id }, cb);
}