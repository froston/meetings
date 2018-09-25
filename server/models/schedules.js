const async = require('async')
const { getDb } = require('../db')
const taskModel = require('./tasks')
const studentModel = require('./students')
const config = require('../config')
const sheets = require('../helpers/sheets')
const sorting = require('../helpers/sorting')

const getAll = (query, cb) => {
  let where = ''
  if (query.month > 0 && query.year > 0) {
    where = `WHERE month = ${query.month} AND year = ${query.year}`
  }
  getDb().query(`SELECT * FROM schedules ${where} ORDER BY month DESC, year DESC`, cb)
}

const getById = (id, cb) => {
  getDb().query('SELECT * FROM schedules WHERE id = ?', id, (err, schedules) => {
    if (err) throw err
    let schedule = schedules[0]
    getDb().query(
      `
      SELECT 
        tasks.id,
        tasks.hall,
        tasks.task,
        tasks.week,
        tasks.month,
        tasks.year,
        tasks.point,
        tasks.completed,
        tasks.helper,
        students.name,
        students.id AS student_id
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
  })
}

const createSchedule = (newSchedule, mainCB) => {
  const scheduleToInsert = {
    month: Number(newSchedule.month),
    year: Number(newSchedule.year),
    weeks: Number(newSchedule.weeks)
  }
  const scheduleWeeks = Array.from({ length: newSchedule.weeks }, (v, i) => i + 1)
  const scheduleTasks = newSchedule.tasks
  const scheduleMonth = scheduleToInsert.month
  const scheduleYear = scheduleToInsert.year
  const scheduleHalls = newSchedule.hall === 'All' ? ['A', 'B'] : [newSchedule.hall]
  // create new schedule
  getDb().query('INSERT INTO schedules SET ?', scheduleToInsert, (err, res) => {
    if (err) throw err
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
                    callbackFinal => {
                      // sorting and query options
                      const sortingOpt = {
                        taskName,
                        hall,
                        month: scheduleMonth,
                        year: scheduleYear
                      }
                      studentModel.getSortedAvailables('student', sortingOpt, (err, students) => {
                        if (err) throw err
                        if (students && students.length) {
                          const limit = students.length > config.limit ? config.limit : students.length
                          const flhsIndex = Math.floor(Math.random() * limit)
                          const finalStudent = students[flhsIndex]
                          const nextPoint = finalStudent.nextPoint + 1
                          // assign task
                          const studentTask = {
                            student_id: finalStudent.id,
                            point: nextPoint,
                            schedule_id: newSchedule.id,
                            task: taskName,
                            week: Number(week),
                            month: Number(newSchedule.month),
                            year: Number(newSchedule.year),
                            hall: hall,
                            completed: false,
                            helper: false
                          }
                          taskModel.createTask(studentTask, err => {
                            studentModel.updateStudentPoint(finalStudent.id, nextPoint, err => {
                              callbackFinal(err, finalStudent.gender)
                            })
                          })
                        } else {
                          callbackFinal('No students!')
                        }
                      })
                    },
                    (gender, callbackHelper) => {
                      if (taskName !== 'Reading' && taskName !== 'Talk') {
                        // sorting and query options
                        const sortingOpt = {
                          taskName,
                          gender,
                          month: scheduleMonth,
                          year: scheduleYear
                        }
                        studentModel.getSortedAvailables('helper', sortingOpt, (err, helpers) => {
                          if (err) throw err
                          if (helpers && helpers.length) {
                            const limit = helpers.length > config.limit ? config.limit : helpers.length
                            const flhsIndex = Math.floor(Math.random() * limit)
                            const finalHelper = helpers[flhsIndex]
                            // assign task
                            const helperTask = {
                              student_id: finalHelper.id,
                              point: null,
                              schedule_id: newSchedule.id,
                              task: taskName,
                              week: Number(week),
                              month: Number(newSchedule.month),
                              year: Number(newSchedule.year),
                              hall: hall,
                              completed: false,
                              helper: true
                            }
                            taskModel.createTask(helperTask, err => {
                              callbackHelper(err)
                            })
                          } else {
                            callbackHelper('No helpers!')
                          }
                        })
                      } else {
                        callbackHelper(null)
                      }
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

const removeSchedule = (id, cb) => {
  getById(id, (err, res) => {
    const schedule = res
    // delete schedule
    getDb().query('DELETE FROM schedules WHERE id = ?', res.id, (err, res) => {
      // delete all related tasks
      getDb().query('DELETE FROM tasks WHERE month = ? AND year = ?', [schedule.month, schedule.year], cb)
    })
  })
}

const generateReport = (id, res) => {
  getById(id, (err, schedule) => {
    if (err) throw err
    sheets.generateSheet(schedule, res)
  })
}

module.exports = {
  getAll,
  getById,
  createSchedule,
  removeSchedule,
  generateReport
}
