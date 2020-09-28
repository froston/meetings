const express = require('express')
const model = require('../models/territories')

const router = express.Router()

router.get('/suggestions', async (req, res) => {
  try {
    const data = await model.getSuggestions()
    res.send(data)
  } catch (err) {
    res.status(500).send(err)
  }
})

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
    if (data) {
      res.send(data)
    } else {
      res.status(404).send(`Territory #${id} not found.`)
    }
  } catch (err) {
    res.status(500).send(err)
  }
})

router.post('/', async (req, res) => {
  try {
    const data = await model.createTerritory(req.body)
    res.send(data)
  } catch (err) {
    res.status(500).send(err)
  }
})

router.patch('/:id', async (req, res) => {
  const id = req.params.id
  try {
    const data = await model.updateTerritory(id, req.body)
    res.send(data)
  } catch (err) {
    res.status(500).send(err)
  }
})

router.delete('/:id', async (req, res) => {
  const id = req.params.id
  try {
    await model.removeTerritory(id)
    res.status(204).end()
  } catch (err) {
    res.status(500).send(err)
  }
})

router.get('/:id/history', async (req, res) => {
  const id = req.params.id
  try {
    const data = await model.getTerritoryHist(id)
    if (data) {
      res.send(data)
    } else {
      res.status(404).send(`Territory history #${id} not found.`)
    }
  } catch (err) {
    res.status(500).send(err)
  }
})

router.delete('/:id/history/:history_id', async (req, res) => {
  const id = req.params.id
  const history_id = req.params.history_id
  try {
    await model.removeHistory(id, history_id)
    res.status(204).end()
  } catch (err) {
    res.status(500).send(err)
  }
})

router.get('/:terNum/view', async (req, res) => {
  const terNum = req.params.terNum
  try {
    const data = await model.getTerritoryNumbers(terNum)
    if (data) {
      res.send(data)
    } else {
      res.status(404).send(`Territory #${terNum} not found.`)
    }
  } catch (err) {
    res.status(500).send(err)
  }
})

router.post('/:id/history', async (req, res) => {
  const id = req.params.id
  try {
    const data = await model.createAssignment(id, req.body)
    res.send(data)
  } catch (err) {
    res.status(500).send(err)
  }
})

router.patch('/:id/history/:history_id', async (req, res) => {
  const id = req.params.history_id
  try {
    const data = await model.updateAssignment(id, req.body)
    res.send(data)
  } catch (err) {
    res.status(500).send(err)
  }
})

router.post('/:id/work', async (req, res) => {
  const id = req.params.id
  try {
    const data = await model.workTerritory(id, req.body)
    res.send(data)
  } catch (err) {
    res.status(500).send(err)
  }
})

module.exports = router
