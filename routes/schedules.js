const express = require('express');
const model = require('../models/schedules')

const router = express.Router();

router.get('/', (req, res) => {
  model.getAll((err, schedules) => {
    if (err) {
      res.status(500).send(err)
    }
    res.send(schedules)
  })
})

module.exports = router;