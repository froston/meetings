const express = require('express')
const model = require('../models/schedules')

const router = express.Router()

router.get('/', (req, res) => {
  model.getAll(req.query, (err, schedules) => {
    if (err) {
      res.status(500).send(err)
    }
    res.send(schedules)
  })
})

router.get('/:id', (req, res) => {
  const id = req.params.id
  model.getById(id, (err, schedule) => {
    if (err) {
      res.status(500).send(err)
    }
    res.send(schedule)
  })
})

router.get('/:id/downloadXls', (req, res) => {
  const id = req.params.id
  const lang = req.query.lang
  req.i18n.changeLanguage(lang)
  model.generateXls(id, lang, req.t, res)
})

router.get('/:id/downloadPdfs', (req, res) => {
  const id = req.params.id
  const beginsWith = req.query.beginsWith
  const lang = req.query.lang
  req.i18n.changeLanguage(lang)
  model.generatePdfs(id, beginsWith, lang, req.t, res)
})

router.post('/', (req, res) => {
  const newSchedule = req.body
  model.createSchedule(newSchedule, (err, schedule) => {
    if (err) {
      res.status(500).send(err)
    }
    res.send(schedule)
  })
})

router.delete('/:id', (req, res) => {
  const id = req.params.id
  model.removeSchedule(id, err => {
    if (err) {
      res.status(500).send(err)
    }
    res.status(204).end()
  })
})

module.exports = router
