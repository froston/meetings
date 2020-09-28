const express = require('express')
const model = require('../models/schedules')

const router = express.Router()

router.get('/', async (req, res, next) => {
  try {
    const data = await model.getAll(req.query)
    res.send(data)
  } catch (err) {
    next(err)
  }
})

router.get('/:id', async (req, res, next) => {
  const id = req.params.id
  try {
    const data = await model.getById(id)
    res.send(data)
  } catch (err) {
    next(err)
  }
})

router.get('/:id/downloadXls', (req, res, next) => {
  const id = req.params.id
  const lang = req.query.lang
  req.i18n.changeLanguage(lang)
  model.generateXls(id, lang, req.t, res)
})

router.get('/:id/downloadPdfs', async (req, res, next) => {
  const id = req.params.id
  const beginsWith = req.query.beginsWith
  const lang = req.query.lang
  req.i18n.changeLanguage(lang)
  model.generatePdfs(id, beginsWith, lang, req.t, res)
})

router.post('/', async (req, res, next) => {
  const newSchedule = req.body
  try {
    const data = await model.createSchedule(newSchedule)
    res.status(201).end()
  } catch (err) {
    next(err)
  }
})

router.delete('/:id', async (req, res, next) => {
  const id = req.params.id
  try {
    await model.removeSchedule(id)
    res.status(204).end()
  } catch (err) {
    next(err)
  }
})

module.exports = router
