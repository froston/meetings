const express = require('express')
const router = express.Router()

router.use('/students', require('./routes/students'))
router.use('/schedules', require('./routes/schedules'))
router.use('/tasks', require('./routes/tasks'))
router.use('/territories', require('./routes/territories'))
router.use('/numbers', require('./routes/numbers'))
router.use('/settings', require('./routes/settings'))
router.use('/users', require('./routes/users'))
router.use('/', (req, res) => res.status(404).send('Endpoint does not exist.'))

module.exports = router
