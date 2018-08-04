const express = require('express')
const router = express.Router()

router.use('/students', require('./routes/students'))
router.use('/schedules', require('./routes/schedules'));
router.use('/', (req, res) => res.status(404).send("Endpoint does not exist."))

module.exports = router