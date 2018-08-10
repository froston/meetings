const { getDb } = require('../db')

exports.getByStudentId = (id, cb) => {
  getDb().query(
    'SELECT * FROM tasks WHERE student_id = ? ORDER BY year DESC, month DESC, week DESC',
    id,
    cb
  )
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
  return new Promise((resolve, reject) => {
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

exports.asyncGetTasks = (studentId, hall) => {
  return new Promise((resolve, reject) => {
    getDb().query(
      `
      SELECT * FROM tasks 
      WHERE student_id = ? AND
      hall = ?
      ORDER BY tasks.year DESC, tasks.month DESC, tasks.week DESC
    `,
      [studentId, hall],
      (err, res) => {
        if (err) reject(err)
        console.log('GETTING TASKS')
        resolve(res)
      }
    )
  })
}
