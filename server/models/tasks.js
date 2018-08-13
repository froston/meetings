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

exports.getTasks = (studentId, cb) => {
  getDb().query(
    `
    SELECT * FROM tasks 
    WHERE student_id = ?
    ORDER BY tasks.year DESC, tasks.month DESC, tasks.week DESC
  `,
    [studentId],
    cb
  )
}

exports.createTask = (task, cb) => {
  const taskToInsert = {
    student_id: task.student_id,
    schedule_id: task.schedule_id,
    task: task.task,
    hall: task.hall,
    week: task.week,
    month: task.month,
    year: task.year,
    point: task.point,
    completed: task.completed,
    helper: task.helper
  }
  getDb().query('INSERT INTO tasks SET ?', taskToInsert, cb)
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
    const taskToInsert = {
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
    getDb().query('INSERT INTO tasks SET ?', taskToInsert, err => {
      if (err) reject(err)
      console.log('CREATING TASK')

      resolve(taskToInsert)
    })
  })
}
