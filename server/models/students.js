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

const getAvailableStudents = (taskName, hall) => {
  return new Promise((resolve, reject) => {
    getDb().query(
      `
    SELECT * FROM students 
    WHERE ${utils.getAvailableName(taskName)} IS TRUE AND 
    (hall = "All" OR hall = ?)
  `,
      [hall],
      async (err, students) => {
        if (err) reject(err)
        await Promise.all(
          students.map(async student => {
            student.tasks = await taskModel.asyncGetTasks(student.id, hall)
            return student
          })
        ).then(students => {
          console.log('FIND STUDENT', students)
          resolve(students)
        })
      }
    )
  })
}

exports.asyncGetFinalStudent = (taskName, hall) => {
  return new Promise(async resolve => {
    const students = await getAvailableStudents(taskName, hall)
    let finalStudent = {}
    const studentsCount = students.length
    if (studentsCount === 1) {
      finalStudent = students[0]
    } else {
      await students.sort(utils.sortStudents(taskName))
      const limit = studentsCount > 5 ? config.limit : studentsCount
      const flhsIndex = Math.floor(Math.random() * limit)
      finalStudent = students[flhsIndex]
    }
    resolve(finalStudent)
  })
}
