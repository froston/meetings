const express = require('express');
const model = require('../models/schedules')

const router = express.Router();

router.get('/', (req, res) => {
  model.getAll((err, schedules) => {
    if (err) {
      res.status(500).send(err)
    }
    if (schedules || schedules.length) {
      res.status(schedules.length ? 200 : 404).send(schedules)
    } else {
      res.status(404).end()
    }
  })
})

module.exports = router;