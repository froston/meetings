const express = require('express')
const model = require('../models/territories')

const router = express.Router()

router.get('/', (req, res) => {
  model.getAll(req.query, (err, data) => {
    if (err) {
      res.status(500).send(err)
    }
    res.send(data)
  })
})

router.get('/:id', (req, res) => {
  const id = req.params.id
  model.getById(id, (err, data) => {
    if (err) {
      res.status(500).send(err)
    }
    if (!data) {
      res.status(404).send('Record not found.')
    }
    res.send(data)
  })
})

module.exports = router
