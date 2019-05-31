const path = require('path')
const fs = require('fs')
const os = require('os')
const hummus = require('hummus')
const { fillForm } = require('./pdf-form-fill')
const moment = require('moment')
const archiver = require('archiver')

const getFileName = lang => {
  switch (lang) {
    case 'es':
      return 'S-89-S.pdf'
    case 'en':
      return 'S-89-E.pdf'
    case 'cs':
      return 'S-89-E.pdf' // TODO get czech form
    default:
      return 'S-89-E.pdf'
  }
}

exports.generatePdfs = (schedule, firstDay = 1, lang, res) => {
  const input = path.join(__dirname, `./forms/${getFileName(lang)}`)
  const fontPath = path.join(__dirname, 'courierb.ttf')
  const folderName = `${schedule.month}_${schedule.year}_${moment().unix()}`
  const folderPath = path.join(os.tmpdir(), folderName)

  fs.mkdirSync(folderPath)

  schedule.tasks.forEach(task => {
    const output = `${folderPath}/${task.student_name}.pdf`
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
      'Check Box03': task.task === 'Return Visit' && task.rv === 1 ? true : false,
      'Check Box04': task.task === 'Return Visit' && task.rv === 2 ? true : false,
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

  res.attachment(`${folderName}.zip`)
  res.set('Content-Type', 'application/zip')

  const archive = archiver('zip')
  archive.pipe(res)

  archive.on('close', () => res.status(200).end())

  archive.directory(`${folderPath}/`, false)
  archive.finalize()
}
