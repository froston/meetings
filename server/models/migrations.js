const async = require('async')
const scheduleModel = require('./schedules')
const taskModel = require('./tasks')

const options = ['Initial Call', 'Return Visit', 'Return Visit', 'Return Visit', 'Bible Study']

/* exports.run = cb => {
  scheduleModel.getAll({}, (err, schedules) => {
    if (err) throw err
    // SCHEDULES
    async.eachLimit(
      schedules,
      1,
      (schedule, doneSchedule) => {
        if (err) throw err
        const scheduleWeeks = Array.from({ length: schedule.weeks }, (v, i) => i + 1)
        // WEEKS
        async.eachLimit(
          scheduleWeeks,
          1,
          (week, doneWeek) => {
            // HALLS
            async.eachLimit(
              ['A', 'B'],
              1,
              (hall, doneHall) => {
                // OPTIONS
                async.eachLimit(
                  options,
                  1,
                  (opt, doneOpt) => {
                    // TASKS
                    taskModel.getBySchedule(schedule.month, schedule.year, (err, tasks) => {
                      if (err) throw err
                      const main = tasks.find(
                        t => t.week == week && t.hall == hall && t.task == opt && !t.helper && t.helper_id == null
                      )
                      const helper = tasks.find(t => t.week == week && t.hall == hall && t.task == opt && t.helper)
                      if (main && helper) {
                        const updateTask = {
                          helper_id: helper.student_id
                        }
                        taskModel.updateTask(main.id, updateTask, err => {
                          if (err) throw err
                          taskModel.removeTask(helper.id, err => {
                            if (err) throw err
                            doneOpt(err)
                          })
                        })
                      } else {
                        doneOpt(null)
                      }
                    })
                  },
                  doneHall
                )
              },
              doneWeek
            )
          },
          doneSchedule
        )
      },
      cb
    )
  })
}
 */
/*
const csv = require('csv-parser');
const path = require('path');
const fs = require('fs');
const numbersModel = require('./numbers')


exports.run = () => {
  const pathname = path.join(__dirname, '../import.csv')
  fs.createReadStream(pathname)
    .pipe(csv(['name', 'number', 'territory', 'details']))
    .on('data', (row) => {
      numbersModel.createNumber({
        name: row.name,
        number: row.number.replace(/-|\s/g, ""),
        territory: row.territory,
        status: null,
        details: row.details == '' ? null : row.details,
      }, console.log)
    })
    .on('end', () => {
      console.log('CSV file successfully processed');
    });
} */
