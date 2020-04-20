const express = require('express')
const auth = require('./auth')
const queue = require('./queue')

const router = express.Router()

router.get('/login', auth.login)
router.get('/callback', auth.callback)
router.get('/refresh_token', auth.refresh_token)
router.post('/add_track', queue.addTrack)
router.get('/current', queue.showCurrent)
router.get('/next', queue.showNext)
router.get('/all', queue.showAll)
router.get('/remove', queue.removeTrack)

module.exports = router