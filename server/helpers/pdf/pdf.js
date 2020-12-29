const path = require('path')
const fs = require('fs')
const os = require('os')
const hummus = require('hummus')
const moment = require('moment')
const archiver = require('archiver')
const merge = require('easy-pdf-merge')
const { PDFImage } = require('./pdf-image')
const { fillForm } = require('./pdf-form-fill')
const consts = require('../consts')

const fontPath = path.join(__dirname, 'courierb.ttf')

const getFileNameS89 = (lang) => {
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

const getFileNameS13 = (lang) => {
  switch (lang) {
    case 'es':
      return 'S-13-S.pdf'
    case 'en':
      return 'S-13-E.pdf'
    case 'cs':
      return 'S-13-B.pdf'
    default:
      return 'S-13-S.pdf'
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
  const input = path.join(__dirname, `./forms/${getFileNameS89(lang)}`)
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
      [fields.returnVisit]: task.task.includes('Return Visit') ? true : false,
      [fields.bibleStudy]: task.task === 'Bible Study' ? true : false,
      [fields.talk]: task.task === 'Talk' ? true : false,
      [fields.mainHall]: task.hall === 'A' ? true : false,
      [fields.auxilliaryHall1]: task.hall === 'B' ? true : false,
      [fields.auxilliaryHall2]: task.hall === 'C' ? true : false,
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

exports.generateS13 = (territories, lang, cb) => {
  const input = path.join(__dirname, `./forms/${getFileNameS13(lang)}`)

  let formsArr = []
  let data = {}
  let terCount = 1
  let indexCount = 1
  let dateIndexCount = 1

  territories.forEach((ter) => {
    if (!!ter.history.length) {
      data[`Terr_${terCount}`] = String(ter.number)

      indexCount = terCount
      dateIndexCount = terCount * 2 - 1

      if (terCount > 5) {
        indexCount = indexCount + 120
        dateIndexCount = dateIndexCount + 240
      }

      ter.history.forEach((h) => {
        let index = String(indexCount).padStart(3, 0)
        let dateIndex1 = String(dateIndexCount).padStart(3, 0)
        dateIndexCount++
        let dateIndex2 = String(dateIndexCount).padStart(3, 0)
        data[`Name_${index}`] = h.assigned
        data[`Date_${dateIndex1}`] = moment(h.date_from).format(getDateFormat(lang))
        data[`Date_${dateIndex2}`] = h.date_to && moment(h.date_to).format(getDateFormat(lang))

        indexCount = indexCount + 5
        dateIndexCount = dateIndexCount + 9
      })

      if (terCount === 10) {
        terCount = 0
        formsArr.push(data)
        data = {}
      }

      terCount++
    }
  })

  if (terCount > 1) {
    formsArr.push(data)
  }

  let pdfFiles = []
  let outputPdf = path.join(os.tmpdir(), `output_${moment().unix()}.pdf`)

  formsArr.forEach((data, idx) => {
    const pdfFilePath = path.join(os.tmpdir(), `temps13_${idx}_${moment().unix()}.pdf`)

    const writer = hummus.createWriterToModify(input, {
      modifiedFilePath: pdfFilePath,
    })

    fillForm(writer, data, {
      defaultTextOptions: {
        font: writer.getFontForFile(fontPath),
        size: 8,
      },
    })

    writer.end()

    pdfFiles.push(pdfFilePath)
  })

  merge(pdfFiles, outputPdf, function (err) {
    if (err) {
      return cb(err)
    }
    cb(null, outputPdf)
  })
}
