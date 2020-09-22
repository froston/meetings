const express = require('express')
const model = require('../models/schedules')

const router = express.Router()

router.get('/', async (req, res) => {
  try {
    const data = await model.getAll(req.query)
    res.send(data)
  } catch (err) {
    res.status(500).send(err)
  }
})

router.get('/:id', async (req, res) => {
  const id = req.params.id
  try {
    const data = await model.getById(id)
    res.send(data)
  } catch (err) {
    res.status(500).send(err)
  }
})

router.get('/:id/downloadXls', (req, res) => {
  const id = req.params.id
  const lang = req.query.lang
  req.i18n.changeLanguage(lang)
  model.generateXls(id, lang, req.t, res)
})

router.get('/:id/downloadPdfs', async (req, res) => {
  const id = req.params.id
  const beginsWith = req.query.beginsWith
  const lang = req.query.lang
  req.i18n.changeLanguage(lang)
  model.generatePdfs(id, beginsWith, lang, req.t, res)
})

router.post('/', async (req, res) => {
  const newSchedule = req.body
  try {
    const data = await model.createSchedule(newSchedule)
    res.status(201).end()
  } catch (err) {
    res.status(500).send(err)
  }
})

router.delete('/:id', async (req, res) => {
  const id = req.params.id
  try {
    await model.removeSchedule(id)
    res.status(204).end()
  } catch (err) {
    res.status(500).send(err)
  }
})

module.exports = router
