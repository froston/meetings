const async = require('async')
const { getDb } = require('../db')
const taskModel = require('./tasks')
const consts = require('../helpers/consts')
const sorting = require('../helpers/sorting')

exports.getAll = (name, cb) => {
  const like = name ? `WHERE name LIKE "%${name}%"` : ``
  getDb().query(`SELECT * FROM students ${like} ORDER BY name`, (err, results) => {
    if (err) throw err
    results.forEach(student => {
      student.available = consts.getAvailable(student)
    })
    cb(err, results)
  })
}

exports.getById = (id, cb) => {
  getDb().query('SELECT * FROM students WHERE id = ?', id, (err, results) => {
    if (err) throw err
    results[0].available = consts.getAvailable(results[0])
    cb(err, results)
  })
}

exports.createStudent = (newStudent, cb) => {
  const studentToInsert = {
    name: newStudent.name,
    participate: newStudent.participate,
    gender: newStudent.gender,
    hall: newStudent.hall,
    nextPoint: newStudent.nextPoint,
    ...consts.setAvailable(newStudent.available)
  }
  getDb().query('INSERT INTO students SET ?', studentToInsert, cb)
}

exports.updateStudent = (id, student, cb) => {
  const studentToUpdate = {
    name: student.name,
    participate: student.participate,
    gender: student.gender,
    hall: student.hall,
    nextPoint: student.nextPoint,
    ...consts.setAvailable(student.available)
  }
  getDb().query('UPDATE students SET ? WHERE id = ?', [studentToUpdate, id], cb)
}

exports.updateStudentPoint = (id, nextPoint, cb) => {
  getDb().query('UPDATE students SET nextPoint = ? WHERE id = ?', [nextPoint, id], cb)
}

exports.removeStudent = (id, cb) => {
  getDb().query('DELETE FROM students WHERE id = ?', id, () => {
    getDb().query('DELETE FROM tasks WHERE student_id = ?', id, cb)
  })
}

exports.getSortedAvailables = (type, options, cb) => {
  const taskName = options.taskName
  const gender = options.gender
  const hall = options.hall
  const month = options.month
  const year = options.year
  switch (type) {
    case 'student':
      getAvailableStudents(taskName, hall, (err, students) => {
        students.sort(sorting.sortStudents(taskName, hall, month, year))
        cb(err, students)
      })
      break
    case 'helper':
      getAvailableHelpers(gender, hall, (err, students) => {
        students.sort(sorting.sortHelpers(taskName, month, year))
        cb(err, students)
      })
      break
    default:
      cb(null, [])
      break
  }
}

const getAvailableStudents = (taskName, hall, cb) => {
  getDb().query(
    `
    SELECT * FROM students 
    WHERE ${consts.getAvailableName(taskName)} IS TRUE AND 
    (hall = "All" OR hall = ?) AND
    participate IS TRUE
  `,
    [hall],
    (err, students) => {
      if (err) throw err
      async.map(
        students,
        (student, callback) => {
          taskModel.getStudentTasks(student.id, (err, tasks) => {
            // distinguish reading task from other tasks
            if (taskName === 'Reading') {
              student.tasks = tasks.filter(t => !t.helper && t.task === 'Reading')
              student.helpTasks = tasks.filter(t => t.helper)
            } else {
              student.tasks = tasks.filter(t => !t.helper && t.task !== 'Reading')
              student.helpTasks = tasks.filter(t => t.helper)
            }
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

const getAvailableHelpers = (gender, hall, cb) => {
  const where = `WHERE (hall = "All" OR hall = ?) AND participate IS TRUE ${gender ? `AND gender = '${gender}'` : ''} `
  getDb().query(`SELECT * FROM students ${where}`, [hall], (err, students) => {
    if (err) throw err
    async.map(
      students,
      (student, callback) => {
        taskModel.getHelperTasks(student.id, (err, tasks) => {
          student.tasks = tasks.filter(t => !t.helper)
          student.helpTasks = tasks.filter(t => t.helper)
          callback(err)
        })
      },
      err => {
        cb(err, students)
      }
    )
  })
}
