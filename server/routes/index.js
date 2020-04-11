const express = require('express');
const auth = require('./auth');

const router = express.Router();

router.get('/login', auth.login);
router.get('/callback', auth.callback);
router.get('/refresh_token', auth.refresh_token);

module.exports = router;