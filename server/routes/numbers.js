const express = require('express')
const model = require('../models/numbers')

const router = express.Router()

router.get('/suggestions', async (req, res, next) => {
  try {
    const data = await model.getSuggestions()
    res.send(data)
  } catch (err) {
    next(err)
  }
})

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
    if (data) {
      res.send(data)
    } else {
      res.status(404).send(`Number #${id} not found.`)
    }
  } catch (err) {
    next(err)
  }
})

router.post('/', async (req, res, next) => {
  try {
    const data = await model.createNumber(req.body)
    res.send(data)
  } catch (err) {
    if (err) {
      if (err.alreadyExists) {
        err.message = req.t('numberDuplicate')
        return res.status(400).send(err)
      }
      return next(err)
    }
    next(err)
  }
})

router.patch('/:id', async (req, res, next) => {
  const id = req.params.id
  try {
    const data = await model.updateNumber(id, req.body)
    res.send(data)
  } catch (err) {
    if (err.alreadyExists) {
      err.message = req.t('numberDuplicate')
      return res.status(400).send(err)
    }
    next(err)
  }
})

router.delete('/:id', async (req, res, next) => {
  const id = req.params.id
  try {
    await model.removeNumber(id)
    res.status(204).end()
  } catch (err) {
    next(err)
  }
})

router.get('/:id/history', async (req, res, next) => {
  const id = req.params.id
  try {
    const data = await model.getNumberHist(id)
    if (data) {
      res.send(data)
    } else {
      res.status(404).send(`Number history #${id} not found.`)
    }
  } catch (err) {
    next(err)
  }
})

router.delete('/:id/history/:history_id', async (req, res, next) => {
  const id = req.params.id
  const history_id = req.params.history_id
  try {
    await model.removeHistory(id, history_id)
    res.status(204).end()
  } catch (err) {
    next(err)
  }
})

module.exports = router
