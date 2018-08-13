const async = require('async')
const { getDb } = require('../db')
const taskModel = require('./tasks')
const studentModel = require('./students')
const utils = require('../utils')
const config = require('../config')

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
        `
      SELECT 
        students.name,
        tasks.hall,
        tasks.task,
        tasks.week,
        tasks.month,
        tasks.year,
        tasks.point,
        tasks.completed,
        tasks.helper
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

const createSchedule = function(newSchedule, mainCB) {
  const scheduleToInsert = {
    month: Number(newSchedule.month),
    year: Number(newSchedule.year),
    weeks: Number(newSchedule.weeks)
  }
  const scheduleWeeks = Array.from(
    { length: newSchedule.weeks },
    (v, i) => i + 1
  )
  const scheduleTasks = newSchedule.tasks
  const scheduleHalls =
    newSchedule.hall === 'All' ? ['A', 'B'] : [newSchedule.hall]
  // create new schedule
  getDb().query('INSERT INTO schedules SET ?', scheduleToInsert, (err, res) => {
    newSchedule.id = res.insertId
    // generate tasks for all weeks, tasks and halls
    async.eachLimit(
      scheduleWeeks,
      1,
      (week, weekCB) => {
        async.eachLimit(
          scheduleTasks[week],
          1,
          (taskName, taskCB) => {
            async.eachLimit(
              scheduleHalls,
              1,
              (hall, hallCB) => {
                async.waterfall(
                  [
                    callbackStudents => {
                      studentModel.getAvailableStudents(
                        taskName,
                        hall,
                        (err, students) => {
                          if (students && students.length) {
                            // sort all students
                            students.sort(utils.sortStudents(taskName, hall))
                            const limit =
                              students.length > config.limit
                                ? config.limit
                                : students.length
                            const flhsIndex = Math.floor(Math.random() * limit)
                            const finalStudent = students[flhsIndex]
                            // assign task
                            const studentTask = {
                              student_id: finalStudent.id,
                              point: finalStudent.nextPoint + 1,
                              schedule_id: newSchedule.id,
                              task: taskName,
                              week: Number(week),
                              month: Number(newSchedule.month),
                              year: Number(newSchedule.year),
                              hall: hall,
                              completed: false,
                              helper: false
                            }
                            callbackStudents(err, studentTask)
                          } else {
                            callbackStudents('No students!')
                          }
                        }
                      )
                    },
                    (studentTask, callbackTask) => {
                      taskModel.createTask(studentTask, err => {
                        callbackTask(err)
                      })
                    }
                  ],
                  hallCB
                )
              },
              taskCB
            )
          },
          weekCB
        )
      },
      () => {
        mainCB(err, scheduleToInsert)
      }
    )
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
