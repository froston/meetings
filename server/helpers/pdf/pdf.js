const path = require('path')
const fs = require('fs')
const hummus = require('hummus')
const { fillForm } = require('./pdf-form-fill')
const moment = require('moment')

exports.generateSchedule = (schedule, firstDay = 1, cb) => {
  const input = path.join(__dirname, './S-89-S.pdf')
  const fontPath = path.join(__dirname, 'courierb.ttf')
  const folderName = path.join(__dirname, `../../public/${schedule.month}-${schedule.year}`)

  if (!fs.existsSync(folderName)) {
    fs.mkdirSync(folderName)
  }

  schedule.tasks.forEach(task => {
    const output = `${folderName}/${task.student_name}.pdf`
    const writer = hummus.createWriterToModify(input, {
      modifiedFilePath: output
    })

    const date = moment(`${firstDay} ${task.month} ${task.year}`, 'D M YYYY').add(task.week - 1, 'w')

    const data = {
      Name: task.student_name,
      Assistant: task.helper_name,
      Date: date.format('DD-MM-YYYY'),
      'Check Box01': task.task === 'Reading' ? true : false,
      'Check Box02': task.task === 'Initial Call' ? true : false,
      'Check Box03': task.task === 'Return Visit' ? true : false,
      'Check Box04': task.task === 'Return Visit' ? true : false,
      'Check Box05': task.task === 'Bible Study' ? true : false,
      'Check Box06': task.task === 'Talk' ? true : false,
      'Check Box08': task.hall === 'A' ? true : false,
      'Check Box09': task.hall === 'B' ? true : false
    }

    fillForm(writer, data, {
      defaultTextOptions: {
        font: writer.getFontForFile(fontPath),
        size: 14
      }
    })
    writer.end()
  })
  cb(null)
}
