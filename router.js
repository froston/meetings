const express = require('express')
const path = require('path')
const router = express.Router()

router.use('/students', require('./routes/students'))
router.use('/schedules', require('./routes/schedules'));

module.exports = router