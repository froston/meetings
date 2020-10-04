const express = require('express')
const model = require('../models/territories')

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
      res.status(404).send(`Territory #${id} not found.`)
    }
  } catch (err) {
    next(err)
  }
})

router.get('/number/:number', async (req, res, next) => {
  const number = req.params.number
  try {
    const data = await model.getByNumber(number)
    if (data) {
      res.send(data)
    } else {
      res.status(404).send(`Territory No. ${number} not found.`)
    }
  } catch (err) {
    next(err)
  }
})

router.post('/', async (req, res, next) => {
  try {
    const data = await model.createTerritory(req.body)
    res.send(data)
  } catch (err) {
    if (err) {
      if (err.alreadyExists) {
        err.message = req.t('territoryDuplicate')
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
    const data = await model.updateTerritory(id, req.body)
    res.send(data)
  } catch (err) {
    if (err.alreadyExists) {
      err.message = req.t('territoryDuplicate')
      return res.status(400).send(err)
    }
    next(err)
  }
})

router.delete('/:id', async (req, res, next) => {
  const id = req.params.id
  try {
    await model.removeTerritory(id)
    res.status(204).end()
  } catch (err) {
    next(err)
  }
})

router.get('/:id/history', async (req, res, next) => {
  const id = req.params.id
  try {
    const data = await model.getTerritoryHist(id)
    if (data) {
      res.send(data)
    } else {
      res.status(404).send(`Territory history #${id} not found.`)
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

router.get('/:terNum/view', async (req, res, next) => {
  const terNum = req.params.terNum
  try {
    const data = await model.getTerritoryNumbers(terNum)
    if (data) {
      res.send(data)
    } else {
      res.status(404).send(`Territory #${terNum} not found.`)
    }
  } catch (err) {
    next(err)
  }
})

router.post('/:id/history', async (req, res, next) => {
  const id = req.params.id
  try {
    const data = await model.createAssignment(id, req.body)
    res.send(data)
  } catch (err) {
    next(err)
  }
})

router.patch('/:id/history/:history_id', async (req, res, next) => {
  const id = req.params.history_id
  try {
    const data = await model.updateAssignment(id, req.body)
    res.send(data)
  } catch (err) {
    next(err)
  }
})

router.post('/:id/work', async (req, res, next) => {
  const id = req.params.id
  try {
    const data = await model.workTerritory(id, req.body)
    res.send(data)
  } catch (err) {
    next(err)
  }
})

module.exports = router
