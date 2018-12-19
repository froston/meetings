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

router.get('/:id/generate', (req, res) => {
  const id = req.params.id
  model.generateReport(id, res)
})

router.get('/:id/generatePdfs', (req, res) => {
  const id = req.params.id
  const beginsWith = req.query.beginsWith
  model.generatePdfs(id, beginsWith, err => {
    if (err) {
      res.status(500).send(err)
    }
    res.status(204).end()
  })
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
