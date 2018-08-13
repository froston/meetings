const async = require('async')
const { getDb } = require('../db')
const taskModel = require('./tasks')
const utils = require('../utils')
const config = require('../config')

exports.getAll = (filter, cb) => {
  getDb().query('SELECT * FROM students ORDER BY name', (err, results) => {
    if (err) throw err
    results.forEach(student => {
      student.available = utils.getAvailable(student)
    })
    cb(err, results)
  })
}

exports.getById = (id, cb) => {
  getDb().query('SELECT * FROM students WHERE id = ?', id, (err, results) => {
    if (err) throw err
    results[0].available = utils.getAvailable(results[0])
    cb(err, results)
  })
}

exports.createStudent = (newStudent, cb) => {
  const studentToInsert = {
    name: newStudent.name,
    gender: newStudent.gender,
    hall: newStudent.hall,
    nextPoint: newStudent.nextPoint,
    ...utils.setAvailable(newStudent.available)
  }
  getDb().query('INSERT INTO students SET ?', studentToInsert, cb)
}

exports.updateStudent = (id, student, cb) => {
  const studentToUpdate = {
    name: student.name,
    gender: student.gender,
    hall: student.hall,
    nextPoint: student.nextPoint,
    ...utils.setAvailable(student.available)
  }
  getDb().query('UPDATE students SET ? WHERE id = ?', [studentToUpdate, id], cb)
}

exports.removeStudent = (id, cb) => {
  getDb().query('DELETE FROM students WHERE id = ?', id, () => {
    getDb().query('DELETE FROM tasks WHERE student_id = ?', id, cb)
  })
}

exports.getAvailableStudents = (taskName, hall, cb) => {
  getDb().query(
    `
    SELECT * FROM students 
    WHERE ${utils.getAvailableName(taskName)} IS TRUE AND 
    (hall = "All" OR hall = ?)
  `,
    [hall],
    (err, students) => {
      async.map(
        students,
        (student, callback) => {
          taskModel.getTasks(student.id, (err, tasks) => {
            student.tasks = tasks
            callback(err)
          })
        },
        err => {
          cb(err, students)
        }
      )
    }
  )
}
