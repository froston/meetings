const path = require('path')
const fs = require('fs')
const os = require('os')
const hummus = require('hummus')
const moment = require('moment')
const archiver = require('archiver')
const { PDFImage } = require('./pdf-image')
const { fillForm } = require('./pdf-form-fill')
const consts = require('../consts')

const getFileName = (lang) => {
  switch (lang) {
    case 'es':
      return 'S-89-S.pdf'
    case 'en':
      return 'S-89-E.pdf'
    case 'cs':
      return 'S-89-B.pdf'
    default:
      return 'S-89-S.pdf'
  }
}

const getDateFormat = (lang) => {
  switch (lang) {
    case 'es':
      return 'DD-MM-YYYY'
    case 'en':
      return 'MM/DD/YYYY'
    case 'cs':
      return 'DD.MM.YYYY'
    default:
      return 'DD-MM-YYYY'
  }
}

exports.generatePdfs = (schedule, firstDay = 1, lang, t, res) => {
  const input = path.join(__dirname, `./forms/${getFileName(lang)}`)
  const fontPath = path.join(__dirname, 'courierb.ttf')
  const folderName = `${schedule.month}_${schedule.year}_${moment().unix()}`
  const folderPath = path.join(os.tmpdir(), folderName)

  let toConvert = []

  fs.mkdirSync(folderPath)

  schedule.tasks.forEach((task) => {
    const fileName = `${task.student_name} ${t(task.task)}`

    const output = `${folderPath}/${fileName.replace(/\s/g, '_')}.pdf`
    const writer = hummus.createWriterToModify(input, {
      modifiedFilePath: output,
    })
    const fields = consts.pdfFields()
    const date = moment(`${firstDay} ${task.month} ${task.year}`, 'D M YYYY').add(task.week - 1, 'w')
    const data = {
      [fields.name]: task.student_name,
      [fields.assistant]: task.helper_name,
      [fields.date]: date.format(getDateFormat(lang)),
      [fields.reading]: task.task === 'Reading' ? true : false,
      [fields.initialCall]: task.task === 'Initial Call' ? true : false,
      [fields.firstRv]: task.task === 'Return Visit' && (task.rv === null || task.rv === 1) ? true : false,
      [fields.secondRv]: task.task === 'Return Visit' && task.rv === 2 ? true : false,
      [fields.bibleStudy]: task.task === 'Bible Study' ? true : false,
      [fields.talk]: task.task === 'Talk' ? true : false,
      [fields.mainHall]: task.hall === 'A' ? true : false,
      [fields.aucilliaryHall1]: task.hall === 'B' ? true : false,
    }
    fillForm(writer, data, {
      defaultTextOptions: {
        font: writer.getFontForFile(fontPath),
        size: 14,
      },
    })
    writer.end()

    const pdfImage = new PDFImage(output, {
      combinedImage: true,
      outputDirectory: folderPath,
      convertOptions: {
        '-colorspace': 'RGB',
        '-interlace': 'none',
        '-density': '200',
        '-quality': '75',
        '-layers': 'flatten',
      },
    })

    toConvert.push(pdfImage.convertFile())
  })

  Promise.all(toConvert)
    .then(() => {
      res.attachment(`${folderName}.zip`)
      res.set('Content-Type', 'application/zip')

      const archive = archiver('zip')
      archive.pipe(res)

      archive.on('close', () => res.status(200).end())
      archive.directory(`${folderPath}/`, false)
      archive.finalize()
    })
    .catch((err) => {
      res.status(500).send(err)
      throw err
    })
}
