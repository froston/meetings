const express = require('express')
const model = require('../models/users')

const router = express.Router()

router.get('/:uid', (req, res) => {
  const uid = req.params.uid
  model.getUserByUID(uid, (err, data) => {
    if (err) {
      res.status(500).send(err)
    }
    if (!data) {
      res.status(404).send({ message: 'User not found.' })
    }
    res.send(data)
  })
})

module.exports = router
