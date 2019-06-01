const moment = require('moment')
const xl = require('excel4node')

exports.generateXls = (schedule, lang, t, cb) => {
  var wb = new xl.Workbook({ defaultFont: { size: 10, name: 'Ubuntu' } })
  var ws = wb.addWorksheet(t('tasks'))
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
  const monthName = moment(schedule.month, 'MM')
    .locale(lang)
    .format('MMMM')
  ws.cell(row, 1, row, 3, true)
    .string(`${t('lifeMinistry')} - ${monthName} ${schedule.year}`)
    .style(style.main)
  row++

  for (let week = 1; week <= schedule.weeks; week++) {
    ws.cell(row, 1, row, 3, true)
      .string(`${t(`week`)} ${week}`)
      .style(style.week)
    row++

    ws.cell(row, 2)
      .string(`${t(`hall`)}  ${t(`hallA`)}`)
      .style(style.hall)
    ws.cell(row, 3)
      .string(`${t(`hall`)}  ${t(`hallB`)}`)
      .style(style.hall)
    row++

    const halls = ['A', 'B']
    const readingMainOnly = schedule.tasks.filter(a => a.week === week && a.task === 'Reading').length === 1
    const hallRow = row
    halls.forEach(hall => {
      const tasks = schedule.tasks.filter(a => a.week === week && a.hall === hall)
      if (tasks.length) {
        row = readingMainOnly && hall === 'B' ? hallRow + 1 : hallRow
        tasks.forEach(task => {
          ws.cell(row, 1).string(task.rv ? t(`${task.rv}. ${task.task}`) : t(task.task))
          if (task.helper_id) {
            ws.cell(row, hall == 'A' ? 2 : 3).string(`${task.student_name} + ${task.helper_name}`)
          } else {
            ws.cell(row, hall == 'A' ? 2 : 3).string(`${task.student_name}`)
          }
          row++
        })
      }
    })
    row++
  }
  wb.write(`${monthName} ${schedule.year}.xlsx`, cb)
}
