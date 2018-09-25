const moment = require('moment')
const xl = require('excel4node')

exports.generateSheet = (schedule, cb) => {
  var wb = new xl.Workbook({ defaultFont: { size: 10, name: 'Ubuntu' } })
  var ws = wb.addWorksheet('Tasks')
  // set rows columns sizes
  ws.row(1).setHeight(30)
  ws.column(1).setWidth(20)
  ws.column(2).setWidth(35)
  ws.column(3).setWidth(35)
  // define styles
  const style = {
    main: wb.createStyle({
      alignment: { wrapText: true, horizontal: 'center', vertical: 'center' },
      font: { bold: true, size: 12 },
      fill: { type: 'pattern', patternType: 'solid', fgColor: '#ffd966' }
    }),
    week: wb.createStyle({
      font: { bold: true, size: 11 },
      fill: { type: 'pattern', patternType: 'solid', fgColor: '#fff2cc' }
    }),
    hall: wb.createStyle({
      font: { bold: true }
    })
  }

  let row = 1

  // start generating worksheet
  const monthName = moment(schedule.month + 1, 'MM').format('MMMM')
  ws.cell(row, 1, row, 3, true)
    .string(`Apply your self to ministry - ${monthName}  ${schedule.year}`)
    .style(style.main)
  row++

  for (let week = 1; week <= schedule.weeks; week++) {
    ws.cell(row, 1, row, 3, true)
      .string(`Week ${week}`)
      .style(style.week)
    row++
    ws.cell(row, 2)
      .string(`Main Hall`)
      .style(style.hall)
    ws.cell(row, 3)
      .string(`Auxiliar Hall`)
      .style(style.hall)
    row++

    // halls
    const halls = ['A', 'B']
    const hallRow = row
    halls.forEach(hall => {
      const tasks = schedule.tasks.filter(a => a.week === week && a.hall === hall)
      const scheduleOptions = [
        'Reading',
        'Initial Call',
        'Return Visit',
        'Return Visit',
        'Return Visit',
        'Bible Study',
        'Talk'
      ]
      let rvIndex = 0
      row = hallRow
      // tasks
      scheduleOptions.map(taskName => {
        let mainTask
        let helperTask
        if (taskName === 'Return Visit') {
          mainTask = tasks.filter(t => t.task === taskName && !t.helper)[rvIndex]
          helperTask = tasks.filter(t => t.task === taskName && t.helper)[rvIndex]
          rvIndex++
        } else {
          mainTask = tasks.find(t => t.task === taskName && !t.helper)
          helperTask = tasks.find(t => t.task === taskName && t.helper)
        }
        if (mainTask) {
          ws.cell(row, 1).string(`${mainTask.task}`)
          if (helperTask) {
            ws.cell(row, hall == 'A' ? 2 : 3).string(
              `${mainTask.name} ${mainTask.point} + ${helperTask && helperTask.name}`
            )
          } else {
            ws.cell(row, hall == 'A' ? 2 : 3).string(`${mainTask.name} ${mainTask.point}`)
          }
        }
        row++
      })
    })
    row++
  }
  wb.write('report.xlsx', cb)
}
