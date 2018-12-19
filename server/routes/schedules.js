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
  model.generateXls(id, res)
})

router.get('/:id/downloadPdfs', (req, res) => {
  const id = req.params.id
  const beginsWith = req.query.beginsWith
  model.generatePdfs(id, beginsWith, res)
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
