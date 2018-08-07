const { getDb } = require('../db')

const studentsCollection = 'students'

exports.getByStudentId = (id, cb) => {
  getDb().query('SELECT * FROM tasks WHERE student_id = ?', id, cb);
}

exports.getBySchedule = (month, year, cb) => {
  getDb().query('SELECT * FROM tasks WHERE month = ? AND year = ?', [month, year], cb);
}

exports.createTask = (task, cb) => {
  const studentToInsert = {
    student_id: task.studentId,
    task: task.task,
    week: task.week,
    month: task.month,
    year: task.year,
    point: task.point,
    completed: task.completed
  }
  getDb().query('INSERT INTO tasks SET ?', studentToInsert, cb);
}

exports.removeTask = (id, cb) => {
  getDb().query('DELETE FROM tasks WHERE id = ?', id, cb);
}

exports.removeBySchedule = (month, year, cb) => {
  getDb().query('DELETE FROM tasks WHERE month = ? && year = ?', [month, year], cb);
}


