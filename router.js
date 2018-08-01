const express = require('express')
const router = express.Router()

router.use('/students', require('./routes/students'))
router.use('/schedules', require('./routes/schedules'));
router.use('/', (req, res) => res.send("Welcome to API!"))

module.exports = router