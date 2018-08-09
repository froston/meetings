const { getDb } = require('../db')
const taskModel = require('./tasks')
const studentModel = require('./students')

const getAll = (filters, cb) => {
  getDb().query('SELECT * FROM schedules', cb)
}

const getById = (id, cb) => {
  getDb().query(
    'SELECT * FROM schedules WHERE id = ?',
    id,
    (err, schedules) => {
      if (err) throw err
      let schedule = schedules[0]
      getDb().query(
        `SELECT 
      students.name,
      tasks.hall,
      tasks.task,
      tasks.week,
      tasks.month,
      tasks.year,
      tasks.point,
      tasks.completed 
    FROM tasks 
    JOIN students ON students.id = tasks.student_id 
    WHERE schedule_id = ?`,
        schedule.id,
        (err, tasks) => {
          if (err) throw err
          schedule.tasks = tasks
          cb(err, schedule)
        }
      )
    }
  )
}

const createSchedule = (newSchedule, cb) => {
  const scheduleToInsert = {
    month: Number(newSchedule.month),
    year: Number(newSchedule.year),
    weeks: Number(newSchedule.weeks)
  }
  const weekTasks = newSchedule.tasks
  // create new schedule
  getDb().query('INSERT INTO schedules SET ?', scheduleToInsert, (err, res) => {
    const scheduleId = res.insertId
    const hall = 'A' // TODO
    // generate all selected weeks
    for (let week = 1; week <= newSchedule.weeks; week++) {
      weekTasks.length &&
        weekTasks[week].forEach(async taskName => {
          // get final selected student
          const finalStudent = await studentModel.asyncGetFinalStudent(
            5,
            taskName,
            hall
          )
          // and find a helper for him
          //const helperStudent = await studentModel.asyncGetFinalStudent(10, taskName, hall, true, finalStudent.gender)
          // create and save tasks
          const studentTask = {
            student_id: finalStudent.id,
            point: finalStudent.nextPoint + 1,
            schedule_id: scheduleId,
            task: taskName,
            week: Number(week),
            month: Number(newSchedule.month),
            year: Number(newSchedule.year),
            hall: hall,
            completed: false,
            helper: false
          }
          /* const helperTask = {
          student_id: helperStudent.id,
          point: null,
          helper: true,
          ...studentTask,
        } */
          await taskModel.asyncCreateTask(studentTask)
          //await taskModel.asyncCreateTask(helperTask)
        })
    }
    cb(err, res)
  })
}

const updateSchedule = (id, schedule, cb) => {}

const removeSchedule = (id, cb) => {
  getById(id, (err, res) => {
    const schedule = res
    // delete schedule
    getDb().query('DELETE FROM schedules WHERE id = ?', res.id, (err, res) => {
      // delete all related tasks
      getDb().query(
        'DELETE FROM tasks WHERE month = ? AND year = ?',
        [schedule.month, schedule.year],
        cb
      )
    })
  })
}

module.exports = {
  getAll,
  getById,
  createSchedule,
  updateSchedule,
  removeSchedule
}
