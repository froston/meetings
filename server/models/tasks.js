const { getDb } = require('../db')

exports.getByStudentId = (id, cb) => {
  getDb().query('SELECT * FROM tasks WHERE student_id = ?', id, cb)
}

exports.getBySchedule = (month, year, cb) => {
  getDb().query(
    'SELECT * FROM tasks WHERE month = ? AND year = ?',
    [month, year],
    cb
  )
}

exports.createTask = (task, cb) => {
  const studentToInsert = {
    student_id: task.studentId,
    task: task.task,
    hall: task.hall,
    week: task.week,
    month: task.month,
    year: task.year,
    point: task.point,
    completed: task.completed
  }
  getDb().query('INSERT INTO tasks SET ?', studentToInsert, cb)
}

exports.removeTask = (id, cb) => {
  getDb().query('DELETE FROM tasks WHERE id = ?', id, cb)
}

exports.removeBySchedule = (month, year, cb) => {
  getDb().query(
    'DELETE FROM tasks WHERE month = ? && year = ?',
    [month, year],
    cb
  )
}

exports.asyncCreateTask = task => {
  return new Promise(function(resolve, reject) {
    const studentToInsert = {
      student_id: task.student_id,
      schedule_id: task.schedule_id,
      task: task.task,
      hall: task.hall,
      week: task.week,
      month: task.month,
      year: task.year,
      point: task.point,
      completed: task.completed
    }
    getDb().query('INSERT INTO tasks SET ?', studentToInsert, (err, res) => {
      if (err) reject(err)
      resolve(res)
    })
  })
}

exports.asyncGetLastTask = (
  studentId,
  taskName,
  hall,
  gender = null,
  helper,
  cb
) => {
  return new Promise(function(resolve, reject) {
    const helperSql = helper ? ` AND helper IS TRUE` : ''
    getDb().query(
      `
    SELECT * FROM tasks 
    WHERE student_id = ? AND
    task = ? AND 
    hall = ?
    ${helperSql}
    ORDER BY tasks.year DESC, tasks.month DESC, tasks.week DESC
  `,
      [studentId, taskName, hall],
      (err, res) => {
        if (err) reject(err)
        resolve(res && res[0])
      }
    )
  })
}
