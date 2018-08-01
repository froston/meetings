const express = require('express');
const model = require('../models/students')

const router = express.Router();

router.get('/', (req, res) => {
  model.getAll((err, users) => {
    if (err) {
      res.status(500).send(err)
    }
    if (users || users.length) {
      res.status(users.length ? 200 : 404).send(users)
    } else {
      res.status(404).end()
    }
  })
})

router.get('/:id', (req, res) => {
  const id = req.params.id
  model.getById(id, (err, user) => {
    if (err) {
      throw err
    }
    res.send(user)
  })
})

module.exports = router;